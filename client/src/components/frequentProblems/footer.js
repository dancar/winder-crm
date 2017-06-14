import React, { Component } from 'react';
import { Button,  ButtonToolbar, Glyphicon} from 'react-bootstrap';
import { Link } from 'react-router-dom'

import Strings from '../../strings.js'

import './frequentProblems.css'

export default class Footer extends Component {
    constructor(props){
        super(props);
        this.state = { shouldHide: props.shouldHide };
    }
    render() {
        return (
            <div>
                <ButtonToolbar>
                    {/*<Button className={ this.state.shouldHide ? 'hide' : ''} > <Glyphicon glyph="log-in" />  צ׳אט עם טכנאי</Button>*/}
                    <p className="call-us"> { Strings.frequentProblems.callTech }</p>
                    <NewTicketButton></NewTicketButton>
                </ButtonToolbar>

            </div>
        );
    }
};

export const NewTicketButton = () => (
        <Button bsStyle="primary" className="open-ticket"> <Link to="/new-ticket" >{ Strings.ticket.openTicket }</Link></Button>
);