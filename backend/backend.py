from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import User, Habit, Completion, UserRepository, get_db

app = FastAPI(root_path="/api")

origins = [
    "http://frontend",
    "http://frontend:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/users")
def read_users():
    users = UserRepository(database=get_db())
    return list(users.find_by({}))


@app.get("/users/{username}")
def read_user(username: str):
    users = UserRepository(database=get_db())
    return users.find_one_by({'name': username})


@app.put("/users/{username}")
def create_user(username: str):
    users = UserRepository(database=get_db())
    user = User(name=username)
    users.save(user)
    return user


@app.delete("/users/{username}")
def delete_user(username: str):
    users = UserRepository(database=get_db())
    while (to_delete := read_user(username)) is not None:
        users.delete(to_delete)



@app.put("/create_default_users")
def create_default_users():
    users = UserRepository(database=get_db())
    emma = read_user("Emma")
    if emma is None:
        users.save(User(name="Emma"))
    charles = read_user("Charles")
    if charles is None:
        users.save(User(name="Charles"))



@app.get("/users/{username}/habits/")
def get_habits(username: str):
    return read_user(username).habits

@app.put("/users/{username}/habits/{habit}")
def create_habit(username: str, habit: str):
    users = UserRepository(database=get_db())
    user = users.find_one_by({'name': username})
    if user is None:
        return

    selected_habit = [h for h in user.habits if h.name == habit]
    if len(selected_habit) == 0:
        user.habits.append(Habit(name=habit))
        users.save(user)



@app.get("/users/{username}/habits/{habit}")
def get_habit(username: str, habit: str):
    users = UserRepository(database=get_db())
    user = users.find_one_by({'name': username})
    if user is None:
        return None

    matches = [h for h in user.habits if h.name == habit]
    if len(matches) == 0:
        return None

    return matches[0]

@app.post("/users/{username}/habits/{habit}/complete")
def complete_habit(username: str, habit: str):
    users = UserRepository(database=get_db())
    user = users.find_one_by({'name': username})
    if user is None:
        return

    matches = [h for h in user.habits if h.name == habit]
    if len(matches) == 0:
        return

    habit = matches[0]

    habit.completions.append(Completion())
    users.save(user)
