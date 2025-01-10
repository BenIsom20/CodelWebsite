from backend.app import app

# Ensure debug mode is turned off
app.config['DEBUG'] = False

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)