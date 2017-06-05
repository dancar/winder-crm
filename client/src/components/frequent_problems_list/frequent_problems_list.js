import React, { Component } from 'react';
import { Table } from 'react-bootstrap';

export default class FrequentProblemsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            problems: []
        }
        this.getFrequentProblems();
    }

    getFrequentProblems() {
        var self = this
        fetch("frequent_problems").then((response) =>{
            return response.json();
        }).then((problems) =>{
            self.setState({problems});
        });
    };

    setProblemDetails(problem){

    };

    render() {
        return (
            <Table bordered condensed hover>
                <tbody>
            {this.state.problems.map(function (problem) {
                return <tr key={problem.id} onClick={this.setProblemDetails(problem)}><td>{problem.subject}</td></tr>
            }.bind(this))}
                </tbody>
            </Table>
        )
    }
}