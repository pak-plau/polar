import React from "react";

export default class Home extends React.Component {
  render() {
    return (
      <div id="home">
        <div id="home-content">
          <div id="navbar">
            <button>HOME</button>
            <button>REGISTRATION</button>
            <button>STUDENT RECORDS</button>
            <button>EMPLOYMENT SERVICES</button>
          </div>
          <div id="home-do"></div>
          <div id="home-dates"></div>
        </div>
      </div>
    );
  }
}
