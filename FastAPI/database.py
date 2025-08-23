from os import getenv
from sys import exit
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()

urlDatabase = getenv("URL_DATABASE")

if not urlDatabase:
    print("There is no URL_DATABASE string in .env. Please provide it before run!")
    exit()

engine = create_engine(getenv("URL_DATABASE"))

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
