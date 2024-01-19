import React from "react";
import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
const { DateTime, Duration} = require("luxon");


interface Completion {
  timestamp: Date;
}

interface Habit {
  name: string;
  description: string;
  completions: Completion[];
}

interface User {
  name: string;
  habits: Habit[];
}

const host = "/api";

function HabitList(props: { username: string }) {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    axios
      .get(`${host}/users/${props.username}`)
      .then((response) => {
        setHabits(response.data["habits"]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="row habit-list g-2">
      <h2>{props.username}</h2>
      {habits.map((habit) => (
        <div className="col">
          <HabitView
            key={props.username + "_" + habit["name"]}
            habit={habit}
            username={props.username}
          />
        </div>
      ))}
    </div>
  );
}

function HabitView(props: { habit: Habit; username: string }) {
  return (
    <div className="card">
      <div className="card-body" style={{ width: "18rem" }}>
        <h5 className="card-title">{props.habit.name}</h5>
        <p className="card-text">{props.habit.description}</p>
        <CompletionStats habit={props.habit} />
        <LastDays habit={props.habit} />
        <CompleteButton habit={props.habit} username={props.username} />
      </div>
    </div>
  );
}

function CompletionStats(props: { habit: Habit }) {
  return (
    <>
    <h6 className="habit-completions">
      {props.habit.completions.length} all time completions.
    </h6>
    <h6 className="habit-completions">
      {props.habit.completions.filter((completion) => {
        return DateTime.now().startOf("day").diff(DateTime.fromISO(completion.timestamp).startOf("day")).as("days") <= 7}).length} this week.
    </h6>
    <h6 className="habit-completions">
      {props.habit.completions.length > 0 ?
        DateTime.now().startOf("day").diff(DateTime.fromISO(props.habit.completions[props.habit.completions.length -1].timestamp).startOf("day")).as("days") + " days since last completion."
      : "never completed"}
    </h6>
    </>
  )
}

function LastDays(props: { habit: Habit }) {
  const today = DateTime.now().startOf("day");
  const lookback_days = 7;

  const recent_completions = props.habit.completions.filter((completion) => {
    return today.diff(DateTime.fromISO(completion.timestamp).startOf("day")).as("days") <= 7;
  });

  const completion_count_per_day = new Array(lookback_days).fill(0);
  recent_completions.forEach((completion) => {
    const completion_date = DateTime.fromISO(completion.timestamp).startOf("day");
    const days_old = today.diff(completion_date).as("days")
    completion_count_per_day[days_old] += 1;
  });

  return (
    <div className="row completion-heatmap gx-2 py-2">
      {completion_count_per_day.reverse().map((count: number, idx: number) => (
        <div className="col-1 completion-heatmap-day px-3">
          <div className="row">
            <div className="col">
              <span className="completion-heatmap-day-label"
                    style={{textAlign: "center"}}>
                {DateTime.now().minus(Duration.fromObject({days: lookback_days - idx - 1})).toFormat('ccccc')[0]}
              </span>
            </div>
          </div>
          <div className={"row " + (count > 0 ? "text-bg-success" : "text-bg-danger")}
              style={{borderRadius: "20%", textAlign: "center"}}>
            <div className="col">
              <span className="completion-heatmap-day-count">{count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}



function CompleteButton(props: { habit: Habit; username: string }) {
  function handleClick() {
    axios
      .post(
        `${host}/users/${props.username}/habits/${props.habit.name}/complete`
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        window.location.reload();
      });
    console.log(`User ${props.username} completed habit ${props.habit.name}`);
    // alert(`User ${props.username} completed habit ${props.habit.name}`);
  }
  return (
    <button type="button" className="btn btn-success" onClick={handleClick}>
      Complete
    </button>
  );
}

function NewHabit(props: { username: string }) {
  function handleSubmit(e: any) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);

    axios
      .put(`${host}/users/${props.username}/habits/${formJson["name"]}`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        window.location.reload();
      });
    console.log(`User ${props.username} created habit ${formJson["name"]}`);
    // alert(`User ${props.username} d habit ${formJson["name"]}`);
  }
  return (
    <div className="row habit-new g-5">
      <h1 className="display-4">New Habit for {props.username}</h1>
      <form className="col" method="post" onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="inputHabitName">Habit Name</label>
          <input
            name="name"
            type="text"
            className="form-control"
            id="inputHabitName"
            placeholder="Work Out"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <header className="row">
        <h1 className="display-1 mt-1">Home Dashboard</h1>
      </header>
      <Tabs>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Charles</Tab>
          <Tab>Emma</Tab>
          <Tab>Add for Charles</Tab>
          <Tab>Add for Emma</Tab>
        </TabList>

        <TabPanel>
          <h2>Overview</h2>
          <div className="row mt-5">
            <div className="col">
              <HabitList key="list-charles" username="Charles" />
              <hr />
              <HabitList key="list-emma" username="Emma" />
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="row mt-5">
            <div className="col">
              <HabitList key="list-charles" username="Charles" />
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="row mt-5">
            <div className="col">
              <HabitList key="list-emma" username="Emma" />
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="row mt-5">
            <div className="col">
              <NewHabit username="Charles" />
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="row mt-5">
            <div className="col">
              <NewHabit username="Emma" />
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
