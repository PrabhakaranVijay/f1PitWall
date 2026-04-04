from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base

class RaceSession(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_key = Column(Integer, unique=True, index=True)
    session_name = Column(String)
    date_start = Column(DateTime)
    date_end = Column(DateTime)
    country_name = Column(String)
    circuit_short_name = Column(String)
    
class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    driver_number = Column(Integer, index=True)
    session_key = Column(Integer, index=True)
    broadcast_name = Column(String)
    full_name = Column(String)
    name_acronym = Column(String)
    team_name = Column(String)
    team_colour = Column(String)
    headshot_url = Column(String)
    country_code = Column(String)

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    session_key = Column(Integer, index=True)
    driver_number = Column(Integer, index=True)
    date = Column(DateTime, index=True)
    rpm = Column(Integer)
    speed = Column(Integer)
    n_gear = Column(Integer)
    throttle = Column(Integer)
    brake = Column(Integer)
    drs = Column(Integer)

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    session_key = Column(Integer, index=True)
    driver_number = Column(Integer, index=True)
    date = Column(DateTime, index=True)
    position = Column(Integer)
