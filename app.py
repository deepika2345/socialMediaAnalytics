from flask import Flask, render_template, request, redirect, flash, session, jsonify,url_for
from pymongo import MongoClient 
import requests

app = Flask(__name__)
app.secret_key = 'your_secret_key'
client = MongoClient('mongodb://localhost:27017/')
db = client['project']
users_collection = db['users']

@app.route('/') 
def index():
    return render_template('index.html',
                            active_form=session.pop('active_form', 'login'),
                            login_message=session.pop('login_message', ''),
                            register_message=session.pop('register_message', ''))


@app.route("/register", methods=["POST"])
def register():
    name = request.form.get("name")
    email = request.form.get("email")
    password = request.form.get("password")
    confirm_password = request.form.get("confirm_password")
    question = request.form.get("security_question")
    answer = request.form.get("security_answer")

    if not all([name, email, password, confirm_password, question, answer]):
        session['active_form'] = 'register'
        session['register_message'] = "Please fill in all the fields."
        return redirect(url_for('index'))
    
    if users_collection.find_one({"email": email}):
        session['active_form'] = 'register'
        session['register_message'] = "User already exists with this email."
        return redirect(url_for('index'))

    if password != confirm_password:
        session['active_form'] = 'register'
        session['register_message'] = "Passwords do not match."
        return redirect(url_for('index'))

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": password,
        "security_question": question,
        "security_answer": answer
    })
    session['login_message'] = "Registration successful. Please log in."
    session['active_form'] = 'login'
    return redirect(url_for('index'))

@app.route('/login', methods=['POST']) 
def login(): 
    email = request.form.get('email') 
    password = request.form.get('password') 
    session['active_form'] = 'login'
    user = users_collection.find_one({"email": email, "password": password})
    if user:    
        session['user_id'] = str(user['_id'])    
        session['name'] = user['name']    
        return redirect('/dashboard') 
    else:    
        session['active_form'] = 'login'
        session['login_message'] = 'Invalid credentials. Please try again.'
        return redirect(url_for('index'))

@app.route('/verify_data', methods=['POST'])
def verify_data():
   if request.is_json:
       try:
           data = request.get_json()
           v_email = data.get('email')
           v_question = data.get('question')
           v_answer = data.get('answer')
           if users_collection.find_one({"email":v_email,"security_question":v_question,"security_answer":v_answer}):
               verification_successful = True
               message = "Verification successful."
           else:
               verification_successful = False
               message = "Verification failed: Invalid credentials."

           response = {
               'success': verification_successful,
               'message': message
           }
           return jsonify(response), 200
       except Exception as e:
           return jsonify({'error': 'Failed to process JSON data', 'details': str(e)}), 400
   else:
       return jsonify({'error': 'Request body is not in JSON format'}), 400

@app.route('/reset_password', methods=['GET','POST']) 
def reset_password(): 
    data=request.get_json()
    email = data.get('email')
    new_password = data.get('newPass')
    user = users_collection.find_one({"email": email}) 
    if not user:    
        return jsonify({"status": "error", "message": "Invalid question or answer."}) 
    users_collection.update_one({"_id": user['_id']}, {"$set": {"password": new_password}}) 
    return jsonify({"status": "success", "message": "Password reset successful."})

@app.route('/dashboard') 
def dashboard(): 
    if 'name' in session:
        return render_template('dashboard.html', name=session['name'])
    return redirect('/')

@app.route('/sc_submission',methods=['POST'])
def sc_submission():
    username = request.form['username']
    password = request.form['password']
    credentials = {"username":username,"password":password}
    print(credentials)
    try:
        response = requests.post('http://localhost:5000/receive_data',json=credentials)
        return jsonify({"status":"success","response":response.json()})
        # return redirect('/dashboard')
    except Exception as e:
        return jsonify({"error":str(e)})

@app.route('/logout') 
def logout(): 
    session.clear() 
    return redirect('/')

if __name__ == '__main__': 
    app.run(debug=True,port=3000,use_reloader=False)
