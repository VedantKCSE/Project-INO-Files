from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import datetime

app = Flask(__name__)
CORS(app)

# Load the time periods data from JSON file
with open('schedule.json', 'r') as file:
    time_periods = json.load(file)

def find_current_lecture(day_schedule):
    current_time = datetime.datetime.now().time()

    for lecture in day_schedule:
        start_time = datetime.datetime.strptime(lecture['start_time'], '%I:%M %p').time()
        end_time = datetime.datetime.strptime(lecture['end_time'], '%I:%M %p').time()

        if start_time <= current_time < end_time:
            return lecture

    return None

def find_next_lecture(day_schedule):
    current_time = datetime.datetime.now().time()

    for lecture in day_schedule:
        start_time = datetime.datetime.strptime(lecture['start_time'], '%I:%M %p').time()

        if start_time > current_time:
            return lecture

    return None

@app.route('/api/schedule')
def get_schedule():
    return {
        "schedule": time_periods
    }

@app.route('/api/today')
def get_todays_schedule():
    today = datetime.datetime.today().strftime('%A')
    todays_schedule = time_periods.get(today)
    return {
        "schedule": todays_schedule
    }

@app.route('/api/current-lecture')
def get_current_lecture():
    today = datetime.datetime.today().strftime('%A')
    todays_schedule = time_periods.get(today)

    if not todays_schedule:
        return jsonify({"message": "No schedule found for today."}), 404

    current_lecture = find_current_lecture(todays_schedule)

    if current_lecture:
        return jsonify({
            "current_lecture": current_lecture,
            "message": "Currently in session."
        })
    else:
        return jsonify({"message": "No lecture is currently in session."})

@app.route('/api/next-lecture')
def get_next_lecture():
    today = datetime.datetime.today().strftime('%A')
    todays_schedule = time_periods.get(today)

    if not todays_schedule:
        return jsonify({"message": "No schedule found for today."}), 404

    next_lecture = find_next_lecture(todays_schedule)

    if next_lecture:
        return jsonify({
            "next_lecture": next_lecture,
            "message": "Next lecture scheduled."
        })
    else:
        return jsonify({"message": "No upcoming lecture found."})

@app.route('/api/update', methods=['PUT'])
def update_lecture():
    data = request.get_json()
    if 'day' not in data or 'id' not in data or 'lecture' not in data:
        return jsonify({"message": "Missing required fields."}), 400

    day = data['day']
    lecture_id = data['id']
    new_lecture = data['lecture']

    if day not in time_periods:
        return jsonify({"message": f"No schedule found for {day}."}), 404

    day_schedule = time_periods[day]
    lecture_found = False

    for lecture in day_schedule:
        if lecture['id'] == lecture_id:
            lecture['lecture'] = new_lecture
            lecture_found = True
            break

    if not lecture_found:
        return jsonify({"message": f"Lecture with ID {lecture_id} not found in {day} schedule."}), 404

    with open('schedule.json', 'w') as file:
        json.dump(time_periods, file, indent=4)

    return jsonify({'message': 'Lecture updated successfully'})


if __name__ == '__main__':
    app.run(debug=True)
