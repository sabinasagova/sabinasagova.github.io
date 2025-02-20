import os
import random
import string
import time
import datetime
import pymysql

from functools import wraps
from dotenv import load_dotenv

from flask import Flask, jsonify, request, g
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail, Message

# Load environment variables
load_dotenv()

# Flask application setup
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# Configuration variables
FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY")
API_KEY = os.getenv("API_KEY")
UNIQUE_ENDPOINT = os.getenv("UNIQUE_ENDPOINT")
FLASK_PORT = int(os.getenv("FLASK_PORT"))
FLASK_HOST= os.getenv("FLASK_HOST")
APP_URL = os.getenv("APP_URL")
APP_EMAIL = os.getenv("APP_EMAIL")

# Mail configuration
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = os.getenv("MAIL_PORT")
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = True
mail = Mail(app)

# API key configuration
app.config["API_KEY"] = API_KEY

# Constants
PREPARED_TASKS = "1"
WEB_APP_URL = "https://slt.ufal.mff.cuni.cz/sabina/"
MESSAGE_SUBJECT = "Vygenerované heslo"
MESSAGE_BODY = "Dobrý den,\n\nzde je Vaše vygenerované heslo ze stránky {WEB_APP_URL}: {password}.\n\nPřejeme Vám příjemný den!"

def get_mysql_connection():
    """
    Establishes a connection to the MySQL database using environment variables.
    
    :return: A connection object to the MySQL database.
    """
    return pymysql.connect(host=os.getenv("MYSQL_HOST"),
                           user=os.getenv("MYSQL_USER"),
                           password=os.getenv("MYSQL_PASSWORD"),
                           db=os.getenv("MYSQL_DB"),
                           port=int(os.getenv("MYSQL_PORT")))

def generate_random_string(length=12):
    """
    Generates a random string of specified length containing both letters and digits.
    Ensures that the generated string contains at least one digit.
    
    :param length: The length of the string to be generated. Default is 12.
    :return: A random string of the specified length.
    """
    characters = string.ascii_letters + string.digits
    while True:
        result = "".join(random.choices(characters, k=length))
        if any(char.isdigit() for char in result):
            return result

def verify_token(token):
    """
    Verifies the provided token by checking its existence and expiration in the database.
    
    :param token: The token to be verified.
    :return: The user ID associated with the token if valid.
    :raises Exception: If the token is missing, expired, or invalid.
    """
    if token == "":
        raise Exception("No token provided")
    connection = get_mysql_connection()
    cursor = connection.cursor()
    currentTime = int(time.time())
    cursor.execute("SELECT vyprseni FROM token WHERE token = %s", (token,))
    timeExpire = cursor.fetchone()
    if not timeExpire or currentTime > timeExpire[0]:
        raise Exception("No token or token expired")
    cursor.execute("SELECT id_uzivatel FROM token WHERE token = %s", (token,))
    userID = cursor.fetchone()
    if not userID:
        raise Exception("Invalid token")
    cursor.close()
    connection.close()
    return userID

def require_api_key(view_function):
    """
    Decorator function to require an API key for accessing specific routes.
    
    :param view_function: The view function to be decorated.
    :return: The decorated function.
    """
    @wraps(view_function)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get("X-API-KEY")
        if api_key and api_key == API_KEY:
            return view_function(*args, **kwargs)
        else:
            return jsonify({"error": "Unauthorized access"}), 401
    return decorated_function

@app.route("/")
def index():
    """
    Root endpoint of the API.
    
    :return: A welcome message in both Czech and English.
    """
    return "CZ: Navštivte index.py pro popis API. EN: Visit index.py for API description.", 200

@app.route("/tokens", methods=["POST"])
def tokens():
    """
    Endpoint to verify a token.
    
    :return: "Token verified successfully" if the token is valid, error message otherwise.
    """
    data = request.get_json()
    token = data.get("token")
    try:
        verify_token(token)
    except Exception as e:
        return str(e), 401
    return "Token verified successfully", 200

@app.route("/get_api_key", methods=["GET"])
def get_unique_endpoint():
    """
    Endpoint to retrieve the API key.
    
    :return: The API key if found, error message otherwise.
    """
    API_KEY = app.config.get("API_KEY")
    if API_KEY:
        return jsonify(API_KEY=API_KEY)
    else:
        return jsonify(error="API_KEY not found"), 500

@app.route("/users/logins/emails/<string:emails>/passwords/<string:passwords>", methods=["POST"])
def logins(emails, passwords):
    """
    Endpoint for user login.
    
    :param emails: User email.
    :param passwords: User password.
    :return: User ID and token if login is successful, error message otherwise.
    """
    connection = get_mysql_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT heslo FROM uzivatel WHERE email = %s", (emails,))
        hashedPassword = cursor.fetchone()
        cursor.execute("SELECT id_uzivatel FROM uzivatel WHERE email = %s", (emails,))
        userID = cursor.fetchone()
        if hashedPassword:
            if bcrypt.check_password_hash(hashedPassword[0], passwords):
                token = generate_random_string(32) # We want a string with 32 characters
                currentTime = int(time.time())
                EXPIRE_TIME = 3600 # Token expires in 1 hour (3600 seconds)
                expireTime = currentTime + EXPIRE_TIME
                # Check if token already exists for the user
                cursor.execute("SELECT token FROM token WHERE id_uzivatel = %s", (userID,))
                existing_token = cursor.fetchone()
                    
                if existing_token:
                    # If token exists, update it
                    cursor.execute("UPDATE token SET token = %s, vyprseni = %s WHERE id_uzivatel = %s",
                                    (token, expireTime, userID))
                else:
                    # If token does not exist, insert new token
                    cursor.execute("INSERT INTO token (id_uzivatel, token, vyprseni) VALUES (%s, %s, %s)",
                                    (userID, token, expireTime))
                connection.commit()
                cursor.close()
                return jsonify({"userID": userID[0], "token": token}), 200
            else:
                return "Wrong password", 401
        else:
            return "User does not exist", 404
    except Exception as e:
        return "Internal server error", 500
    finally:
        cursor.close()
        connection.close()

@app.route("/users/registrations/emails/<string:emails>", methods=["POST"])
def registrations(emails):
    """
    Endpoint for user registration.
    
    :param emails: User email.
    :return: The email of the registered user.
    """
    password = generate_random_string(12) # We want a string with 12 characters
    hashedPassword = bcrypt.generate_password_hash(password).decode("utf-8")
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM uzivatel WHERE email = %s", (emails,))
    userExists = cursor.fetchone()
    if userExists:
        cursor.execute("UPDATE uzivatel SET heslo = %s WHERE email = %s", (hashedPassword, emails))
    else:
        cursor.execute("INSERT INTO uzivatel (email, heslo) VALUES (%s, %s)", (emails, hashedPassword))
    connection.commit()
    cursor.close()
    connection.close()
    msg = Message(MESSAGE_SUBJECT, sender=APP_URL, recipients=[emails])
    msg.body = MESSAGE_BODY.format(WEB_APP_URL=WEB_APP_URL, password=password)
    mail.send(msg)
    return emails

@app.route("/tasks/users", methods=["POST"])
def tasksUser():
    """
    Endpoint to retrieve tasks for a user based on token.
    
    :return: A list of tasks assigned to the user.
    """
    data = request.get_json()
    token = data.get("token")
    try:
        userID = verify_token(token)
    except Exception as e:
        return str(e), 401
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM ukol WHERE id_uzivatel = %s OR id_uzivatel = %s", (userID, PREPARED_TASKS)) # ALL PREPARED TASKS HAVE ID_UZIVATEL = 1
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    response = []
    for row in data:
        response.append({"taskID": row[0], "assignment": row[1], "solution": row[2], "userID": row[3]})
    return jsonify(response), 200

@app.route("/tasks", methods=["GET"])
@require_api_key
def showTasks():
    """
    Endpoint to show all prepared tasks.
    
    :return: A list of all prepared tasks.
    """
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM ukol WHERE id_uzivatel = %s", (PREPARED_TASKS)) # ALL PREPARED TASKS HAVE ID_UZIVATEL = 1
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    response = []
    for row in data:
        response.append({"taskID": row[0], "assignment": row[1], "solution": row[2]})
    return jsonify(response), 200

@app.route("/tasks", methods=["POST"])
def postTasks():
    """
    Endpoint to post a new task.
    
    :return: Status message indicating success or failure.
    """
    data = request.get_json()
    token = data.get("token")
    try:
        userID = verify_token(token)
    except Exception as e:
        return str(e), 401
    connection = get_mysql_connection()
    cursor = connection.cursor()
    
    # Check if the task belongs to the user
    cursor.execute("SELECT id_uzivatel FROM token WHERE token = %s", (token,))
    result = cursor.fetchone()
    
    if not result:
        cursor.close()
        connection.close()
        return "Task not found", 404
        
    if result != userID:
        cursor.close()
        connection.close()
        return "Wrong user", 403
    if request.method == "POST":
        data = request.get_json()
        assignment = data.get("assignment")
        solution = data.get("solution")
        cursor.execute("INSERT INTO ukol (id_uzivatel, zadani, reseni) VALUES (%s, %s, %s)",
                       (userID, assignment, solution))
        connection.commit()
        cursor.close()
        connection.close()
        return "Task posted successfully", 200

@app.route("/tasks/taskID/<int:taskID>", methods=["DELETE"])
def deleteTasks(taskID):
    """
    Endpoint to delete a task.
    
    :param taskID: The ID of the task to be deleted.
    :return: Status message indicating success or failure.
    """
    data = request.get_json()
    token = data.get("token")
    try:
        userID = verify_token(token)
    except Exception as e:
        return str(e), 401
    connection = get_mysql_connection()
    cursor = connection.cursor()
    
    # Check if the task belongs to the user
    cursor.execute("SELECT id_uzivatel FROM token WHERE token = %s", (token,))
    result = cursor.fetchone()
    
    if not result:
        cursor.close()
        connection.close()
        return "Task not found", 404
        
    if result != userID:
        cursor.close()
        connection.close()
        return "Wrong user", 403
    
    cursor.execute("DELETE FROM kod_ukol WHERE id_ukol = %s", (taskID,))
    connection.commit()
    cursor.execute("DELETE FROM ukol WHERE id_ukol = %s", (taskID,))
    connection.commit()
    cursor.close()
    connection.close()
    return "Task deleted successfully", 200

@app.route("/codes", methods=["POST"])
def codes():
    """
    Endpoint to create a new code and associate it with tasks.
    
    :return: Status message indicating success or failure.
    """
    data = request.json
    token = data.get("token")
    code = data.get("code")
    userID = data.get("userID") 
    checkedBoxes = data.get("checkedBoxes")
    try:
        userID = verify_token(token)
    except Exception as e:
        return str(e), 401
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT kod FROM kod WHERE kod = %s", (code,))
    codeExists = cursor.fetchone()
    if codeExists:
        cursor.close()
        connection.close()
        return "Code already exists", 400
    else:
        cursor.execute("INSERT INTO kod (kod, id_uzivatel) VALUES (%s, %s)", (code, userID))
        connection.commit()
        cursor.execute("SELECT LAST_INSERT_ID()")
        codeID = cursor.fetchone()[0]
        for taskID in checkedBoxes:
            cursor.execute("INSERT INTO kod_ukol (id_kod, id_ukol) VALUES (%s, %s)", (codeID, taskID))
            connection.commit()
        cursor.close()
        connection.close()
        return "Code created successfully", 200

@app.route("/codes/codeID/<string:codes>", methods=["GET"])
def codeID(codes):
    """
    Endpoint to retrieve code information.
    
    :param codes: The code to be retrieved.
    :return: Code details if found, empty list otherwise.
    """
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM kod WHERE kod = %s", (codes,))
    data = cursor.fetchone()
    cursor.close()
    connection.close()
    if data:
        return jsonify({"codeID": data[0]}), 200
    else:
        return jsonify([]), 404

@app.route("/tasks/codes/<string:codes>", methods=["GET"])
@require_api_key
def tasks(codes):
    """
    Endpoint to retrieve tasks associated with a specific code.
    
    :param codes: The code to retrieve tasks for.
    :return: A list of tasks associated with the code.
    """
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT ukol.zadani, ukol.reseni
        FROM kod
        JOIN kod_ukol ON kod.id_kod = kod_ukol.id_kod
        JOIN ukol ON kod_ukol.id_ukol = ukol.id_ukol
        WHERE kod.kod = %s
    """, (codes,))
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    if data:
        response = [{"assignment": row[0], "solution": row[1]} for row in data]
        return jsonify(response), 200
    else:
        return jsonify([]), 404

@app.route("/tables/<string:tables>", methods=["GET"])
def tables(tables):
    """
    Endpoint to retrieve data from a specific table.
    
    :param tables: The table name to retrieve data from.
    :return: Data and column names from the specified table.
    """
    try:
        connection = get_mysql_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM " + tables)
        data = cursor.fetchall()
        cursor.close()
        connection.close()
        get_mysql_connection().close()
        column_names = [column[0] for column in cursor.description]
        return jsonify({"column_names": column_names, "data": data})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=True, threaded=True)