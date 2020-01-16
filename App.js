import React from 'react';
import logo from './logo.svg';
import './App.css';
import healthVital from './component/healthVitals/Healthvitals';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
        "heartRate" : 0,
        "breathRate" : 0,
        "buttonName" : "Start"
    }
    this.wsCon=new WebSocket('ws://localhost:8080/','echo-protocol');
    this.wsCon.onmessage = (message) => {
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


render() {
  return (
   <div className="App">
   <div>
       <div>HeartRate : {this.state.heartRate}</div>
   </div>
   <div>
      <div>BreathRate : {this.state.breathRate}</div>
   </div>
   <button onClick={() => {
      this.wsCon.send(this.state.buttonName);
   }}>{this.state.buttonName}</button>
   </div>
  );
}

}

export default App;
