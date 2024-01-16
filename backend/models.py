import datetime
from typing import List, Optional

from pydantic import BaseModel, Field
from pydantic_mongo import AbstractRepository, ObjectIdField
from pymongo import MongoClient


DEFAULT_USERS = ["Emma", "Charles"]


class Completion(BaseModel):
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.now)
    # id: ObjectIdField = None


class Habit(BaseModel):
    name: str
    desription: Optional[str] = None
    completions: List[Completion] = []
    # id: ObjectIdField = None


class User(BaseModel):
    name: str
    habits: List[Habit] = []
    id: ObjectIdField = None



# class HabitRepository(AbstractRepository[Habit]):
#     class Meta:
#         collection_name = 'habits'


class UserRepository(AbstractRepository[User]):
    class Meta:
        collection_name = 'users'


# class CompletionRepository(AbstractRepository[Completion]):
#     class Meta:
#         collection_name = 'completions'



def get_db():
    client = MongoClient("mongodb://localhost:27017")
    database = client["habit_tracker"]
    return database


def get_users() -> UserRepository:
    users = UserRepository(database=get_db())
    maybe_create_users(users)
    return users


def maybe_create_users(users: UserRepository):
    for user_name in DEFAULT_USERS:
        maybe_create_user(user_name, users)


def maybe_create_user(name: str, users: UserRepository) -> None:
    user = User(name=name)
    if not users.find_one_by({'name': user.name}):
        users.save(user)