import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import Search from '../search/search';
import Footer from '../footer/footer';


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
            <div>
                <Search></Search>
                <h1>תקלות נפוצות</h1>
                <Table bordered condensed hover>
                    <tbody>
                {this.state.problems.map(function (problem) {
                    return <tr key={problem.id} onClick={this.setProblemDetails(problem)}><td>{problem.subject}</td></tr>
                }.bind(this))}
                    </tbody>
                </Table>
                <Footer/>
            </div>
        )
    }
}