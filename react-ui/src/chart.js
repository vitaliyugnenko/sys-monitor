import React, { Component } from "react";
import "./style.css";

class Chart extends Component {
    constructor() {
        super();
        this.state = {
            cpu: 0,
            color: "",
            mem: 0,
            connection: new WebSocket(
                "ws://localhost:5000"
            ),
        };

        this.HandleChange = this.HandleChange.bind(this);
        this.SendMessage = this.SendMessage.bind(this);
    }

    HandleChange(data) {
        this.setState({
            cpu: data.cpu,
            mem: data.mem,
            freeMem: data.freeMem,
            totalMem: data.totalMem,
            time: data.time,
            date: data.date,
            cpu_color: data.cpu < 50 ? "green" : "red",
            mem_color: data.mem < 50 ? "green" : "red",
        });
    }

    start = () =>
        this.setState({
            connection: new WebSocket(
                "ws://localhost:5000"
            ),
        });

    SendMessage = () => {
        let connection = this.state.connection;
        connection.send(
            JSON.stringify({
                type: "message",
                nickname: "name",
                text: "outgoingMessage",
            })
        );
        connection.onerror = function (error) {
            console.log(`ERROR - ${error}`);
        };
    };

    componentDidMount() {
        
        let connection = this.state.connection;
        connection.onopen = () => {
            this.SendMessage();
        };
        connection.onmessage = (message) => {
            let mess = JSON.parse(message.data);
            this.HandleChange(mess);
        };
        connection.onclose = () => this.start();
        console.log(123456789);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.connection !== this.state.connection) {
            let connection = this.state.connection;
            connection.onopen = () => {
                this.SendMessage();
            };
            connection.onmessage = (message) => {
                let mess = JSON.parse(message.data);
                this.HandleChange(mess);
            };
            connection.onclose = () => this.start();
        }
    }

    render() {
        let cpu = {
            width: `${this.state.cpu}%`,
            height: "100%",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            margin: "5px",
            transition: "0.5s",
            backgroundColor: `${this.state.cpu_color}`,
        };

        let mem = {
            width: `${this.state.mem}%`,
            height: "100%",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            margin: "5px",
            transition: "0.5s",
            backgroundColor: `${this.state.mem_color}`,
        };

        return (
            <div className="container">
                <div className="dateTime">
                    <div>{this.state.time}</div> <div>{this.state.date}</div>
                </div>
                <div className="cpu">
                    <div className="cpu__title">CPU Usage</div>
                    <div className="val__container">
                        <div style={cpu} id="cpu__val"></div>
                        <p>{this.state.cpu}%</p>
                    </div>
                </div>
                <div className="memory">
                    <div className="memory__title">Memory Usage</div>
                    <p>Total: {this.state.totalMem}Gb</p>
                    <p>Free: {this.state.freeMem}Gb</p>
                    <div className="val__container">
                        <div style={mem} id="memory__val"></div>
                        <p>{this.state.mem}%</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chart;
