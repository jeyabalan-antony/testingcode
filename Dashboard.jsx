/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from "react";
import ChartistGraph from "react-chartist";
import { Grid, Row, Col } from "react-bootstrap";

import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import { Tasks } from "components/Tasks/Tasks.jsx";
import {
  dataPie,
  legendPie,
  dataSales,
  optionsSales,
  responsiveSales,
  legendSales,
  dataBar,
  optionsBar,
  responsiveBar,
  legendBar
} from "variables/Variables.jsx";


const buttonNames=['Start sensor','Configuring...','Stop sensor'];

const buttonStyle = {
  margin: '10px',
  width: '110px',
  height: '40px'
};

class Dashboard extends Component {
    constructor() {
    super();
    this.index=0;
    this.state = {
        "heartRate" : 0,
        "breathRate" : 0,
        "buttonName" : "Start sensor"
    }
    this.wsCon=new WebSocket('ws://localhost:8080/','echo-protocol');
    this.wsCon.onmessage = (message) => {
      if(this.index == 1){
      this.index = 2;
      this.setState({buttonName:buttonNames[this.index]});
      }
      const data = JSON.parse(message.data);

      var idx = 60;
      var breathrate = data.slice(idx,idx+4);
      var heartrate = data.slice(idx+4,idx+8);
      
      
      if(breathrate[0] >= 12 && breathrate[0] <= 22)
      {
          this.setState({breathRate:breathrate[0]})
      }
      if(heartrate[0] >= 65 && heartrate[0] <= 85)
      {
          this.setState({heartRate:heartrate[0]})
      }
  
      console.log(message);
  }
}

  createLegend(json) {
    var legend = [];
    for (var i = 0; i < json["names"].length; i++) {
      var type = "fa fa-circle text-" + json["types"][i];
      legend.push(<i className={type} key={i} />);
      legend.push(" ");
      legend.push(json["names"][i]);
    }
    return legend;
  }
  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="fa fa-heartbeat" />}
                statsText="Heart rate"
                statsValue={this.state.heartRate}
                statsIcon={<i className="fa fa-heart" />}
                statsIconText="Your Heart rate"
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-wallet" />}
                statsText="Breath rate"
                statsValue={this.state.breathRate}
                statsIcon={<i className="fa fa-calendar-o" />}
                statsIconText="Last day"
              />
            </Col>
            <Col lg={3} sm={6}>
	    <Row>
	    <button style={buttonStyle} onClick={() => {
      if(this.index == 1)
         return;
      this.wsCon.send(this.state.buttonName);
      this.index =(this.index+1)%3;
      this.setState({buttonName:buttonNames[this.index]});
   }}>{this.state.buttonName}</button>
	    </Row>
	    <Row>
	    </Row>
	    <Row>
	    <button style={buttonStyle} onClick={() => { this.wsCon.send('PeopleCount'); }}>PeopleCount</button>
	    </Row>
            </Col>
          </Row>
          <Row>
            <Col md={8}>
              <Card
                statsIcon="fa fa-history"
                id="chartHours"
                title="Health Behavior"
                category="24 Hours performance"
                stats="Updated 3 minutes ago"
                content={
                  <div className="ct-chart">
                    <ChartistGraph
                      data={dataSales}
                      type="Line"
                      options={optionsSales}
                      responsiveOptions={responsiveSales}
                    />
                  </div>
                }
                legend={
                  <div className="legend">{this.createLegend(legendSales)}</div>
                }
              />
            </Col>
            <Col md={4}>
              <Card
                statsIcon="fa fa-clock-o"
                title="Health Statistics"
                category="Last Campaign Performance"
                stats="Campaign sent 2 days ago"
                content={
                  <div
                    id="chartPreferences"
                    className="ct-chart ct-perfect-fourth"
                  >
                    <ChartistGraph data={dataPie} type="Pie" />
                  </div>
                }
                legend={
                  <div className="legend">{this.createLegend(legendPie)}</div>
                }
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card
                id="chartActivity"
                title="2014 Sales"
                category="All products "
                stats="Data information certified"
                statsIcon="fa fa-check"
                content={
                  <div className="ct-chart">
                    <ChartistGraph
                      data={dataBar}
                      type="Bar"
                      options={optionsBar}
                      responsiveOptions={responsiveBar}
                    />
                  </div>
                }
                legend={
                  <div className="legend">{this.createLegend(legendBar)}</div>
                }
              />
            </Col>

            <Col md={6}>
              <Card
                title="Tasks"
                category="Backend development"
                stats="Updated 3 minutes ago"
                statsIcon="fa fa-history"
                content={
                  <div className="table-full-width">
                    <table className="table">
                      <Tasks />
                    </table>
                  </div>
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Dashboard;
