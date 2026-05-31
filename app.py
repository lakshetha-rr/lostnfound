from flask import Flask, render_template, request, redirect, session
import sqlite3
import os


app = Flask(__name__)
app.secret_key = "secret123"

conn = sqlite3.connect('database.db', check_same_thread=False)

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------- DATABASE ----------
def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    

    c.execute("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT, password TEXT)")
    c.execute("""CREATE TABLE IF NOT EXISTS lost_items(
        id INTEGER PRIMARY KEY,
        name TEXT, category TEXT, color TEXT, location TEXT,
        image TEXT, owner_email TEXT)""")

    c.execute("""CREATE TABLE IF NOT EXISTS found_items(
        id INTEGER PRIMARY KEY,
        name TEXT, category TEXT, color TEXT, location TEXT,
        image TEXT, finder_email TEXT)""")

    c.execute("""CREATE TABLE IF NOT EXISTS claims(
    id INTEGER PRIMARY KEY,
    item_id INTEGER,
    name TEXT,
    phone TEXT,
    proof TEXT,
    image TEXT,
    status TEXT)""")



    conn.commit()
    conn.close()

init_db()

# ---------- LOGIN ----------
@app.route("/", methods=["GET","POST"])
@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        c = conn.cursor()
        user = c.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()

        if not user:
            return render_template("login.html",
                                   error="Account not found. Please create an account first.")

        if user[2] != password:
            return render_template("login.html",
                                   error="Incorrect password.")

        session['user'] = email
        return redirect('/home')

    return render_template('login.html')


# ---------- SIGNUP ----------
@app.route("/signup", methods=["GET","POST"])
def signup():
    if request.method=="POST":
        email=request.form["email"]
        password=request.form["password"]

        if not email.endswith("@vitstudent.ac.in"):
            return "Only VIT student emails allowed"

        conn=sqlite3.connect("database.db")
        c=conn.cursor()
        c.execute("INSERT INTO users(email,password) VALUES (?,?)",(email,password))
        conn.commit()
        conn.close()
        return redirect("/login")

    return render_template("signup.html")

# ---------- HOME ----------
@app.route("/home")
def home():
    if "user" not in session:
        return redirect("/login")
    return render_template("home.html")

# ---------- LOST ----------
@app.route("/lost", methods=["GET","POST"])
def lost():
    if "user" not in session:
        return redirect("/login")

    conn=sqlite3.connect("database.db")
    c=conn.cursor()

    if request.method=="POST":
        name=request.form["name"]
        category=request.form["category"]
        color=request.form["color"]
        location=request.form["location"]

        image=request.files["image"]
        filename=image.filename
        image.save(os.path.join(UPLOAD_FOLDER, filename))

        c.execute("INSERT INTO lost_items(name,category,color,location,image,owner_email) VALUES (?,?,?,?,?,?)",
                  (name,category,color,location,filename,session["user"]))
        conn.commit()

    c.execute("SELECT * FROM lost_items")
    items=c.fetchall()
    conn.close()

    return render_template("lost.html", items=items)

# ---------- FOUND ----------
@app.route("/found", methods=["GET","POST"])
def found():
    if "user" not in session:
        return redirect("/login")

    conn=sqlite3.connect("database.db")
    c=conn.cursor()

    if request.method=="POST":
        name=request.form["name"]
        category=request.form["category"]
        color=request.form["color"]
        location=request.form["location"]

        image=request.files["image"]
        filename=image.filename
        image.save(os.path.join(UPLOAD_FOLDER, filename))

        c.execute("INSERT INTO found_items(name,category,color,location,image,finder_email) VALUES (?,?,?,?,?,?)",
                  (name,category,color,location,filename,session["user"]))
        conn.commit()

    c.execute("SELECT * FROM found_items")
    items=c.fetchall()
    conn.close()

    return render_template("found.html", items=items)

# ---------- MATCHES ----------
@app.route("/matches")
def matches():
    if "user" not in session:
        return redirect("/login")

    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    lost_items = c.execute("SELECT * FROM lost_items").fetchall()
    found_items = c.execute("SELECT * FROM found_items").fetchall()

    matches = []

    for l in lost_items:
        for f in found_items:

            score = 0

            # category match
            if l[2] == f[2]:
                score += 40

            # color match
            if l[3] == f[3]:
                score += 30

            # location match
            if l[4] == f[4]:
                score += 30

            if score > 0:
                # check claim status for this found item
                claim = c.execute(
                    "SELECT status FROM claims WHERE item_id=? ORDER BY id DESC LIMIT 1",
                    (f[0],)
                ).fetchone()

                claim_status = claim[0] if claim else None

                matches.append({
                    "score": score,
                    "category": l[2],
                    "color": l[3],
                    "location": l[4],
                    "found_id": f[0],
                    "status": claim_status
                })

    conn.close()
    return render_template("matches.html", matches=matches)



# ---------- CLAIM ----------

@app.route("/claim/<int:item_id>", methods=["GET","POST"])
def claim(item_id):
    if request.method == "POST":
        name = request.form["name"]
        phone = request.form["phone"]
        proof = request.form["proof"]

        image = request.files["proof_image"]
        filename = image.filename
        image.save(os.path.join(UPLOAD_FOLDER, filename))

        conn = sqlite3.connect("database.db")
        c = conn.cursor()

        c.execute("""
        INSERT INTO claims(item_id,name,phone,proof,image,status)
        VALUES (?,?,?,?,?,?)
        """, (item_id,name,phone,proof,filename,"Pending"))

        conn.commit()
        conn.close()

        return redirect("/matches")

    return render_template("claim.html", item_id=item_id)



# ---------- ADMIN ----------
@app.route("/admin-login", methods=["GET","POST"])
def admin_login():
    if request.method=="POST":
        if request.form["password"]=="admin123":
            session["admin"]=True
            return redirect("/admin-claims")
    return render_template("admin-login.html")

@app.route("/admin-claims")
def admin_claims():
    if "admin" not in session:
        return redirect("/admin-login")

    conn=sqlite3.connect("database.db")
    c=conn.cursor()
    c.execute("SELECT * FROM claims")
    claims=c.fetchall()
    conn.close()

    return render_template("admin-claims.html", claims=claims)



@app.route("/my-claims")
def my_claims():
    if "user" not in session:
        return redirect("/login")

    conn=sqlite3.connect("database.db")
    c=conn.cursor()
    c.execute("SELECT * FROM claims WHERE user_email=?", (session["user"],))
    claims=c.fetchall()
    conn.close()

    return render_template("my-claims.html", claims=claims)


@app.route("/approve/<int:id>")
def approve(id):
    conn=sqlite3.connect("database.db")
    c=conn.cursor()
    c.execute("UPDATE claims SET status='Approved' WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return redirect("/admin-claims")


@app.route("/reject/<int:id>")
def reject(id):
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("UPDATE claims SET status='Rejected' WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return redirect("/admin-claims")


# ---------- LOGOUT ----------
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

@app.route("/delete-lost/<int:item_id>")
def delete_lost(item_id):

    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("DELETE FROM lost_items WHERE id=?", (item_id,))

    # remove old claims
    c.execute("DELETE FROM claims WHERE item_id=?", (item_id,))

    conn.commit()
    conn.close()

    return redirect("/lost")

@app.route("/delete-found/<int:item_id>")
def delete_found(item_id):

    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("DELETE FROM found_items WHERE id=?", (item_id,))

    # remove old claims
    c.execute("DELETE FROM claims WHERE item_id=?", (item_id,))

    conn.commit()
    conn.close()

    return redirect("/found")



if __name__=="__main__":
    app.run(debug=True)
