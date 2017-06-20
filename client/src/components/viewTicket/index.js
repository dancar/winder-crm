import React from 'react'
import { Link } from 'react-router-dom'
import { Table, Col, Row, FormGroup, Form, FormControl, ControlLabel, Button} from 'react-bootstrap'
import './viewTicket.css'
import { getTicket, updateTicket, updateTicketStatus} from '../../api.js'
import strings from '../../strings.js'
import LoadingSpinner from '../loadingSpinner.js'
const TICKET_STATUSES = ['open', 'closed', 'inTherapy']

export default class ViewTicket extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            newUpdateText: '',
            ticket: {
                user: {},
                details: {},
                ticket_updates: []
            }
        }
    }

    componentDidMount () {
        this.fetchData()
    }

    fetchData = () => {
        this.setState({isLoading: true})
        getTicket(this.props.match.params.id)
            .then( (ticket) => {
                this.setState({
                    ticket,
                    isLoading: false
                })
            })
    }

    formatDate(date) {
        return new Date(date).toLocaleString()
    }

    renderTicketUpdate = (ticketUpdate) => {
        const user = ticketUpdate.user
        return (
            <table key={ticketUpdate.id} className="ticket-update-table">
                <tbody>
              <tr>
                <td className="ticket-update-user">
                  { ticketUpdate.user ? `${user.firstName} ${user.lastName}:` : '' }
                </td>

                <td className="ticket-update-date ltr" >
                  { this.formatDate(ticketUpdate.createdAt) }
                </td>
              </tr>

              <tr className="ticket-update-text" >
                <td colSpan={2}>
                  { ticketUpdate.text }
                </td>
              </tr>
                </tbody>
            </table>
            )
    }

    handleSubmitUpdate = (e) => {
        e.preventDefault()
        const text = this.state.newUpdateText
        this.setState({
            newUpdateText: '',
            isLoading: true
        })
        updateTicket(this.state.ticket.id, this.state.newUpdateText)
            .then( () => {
                this.fetchData()
            })
    }

    updateTicketStatus = () => {
        this.setState({ isLoading: true})
        updateTicketStatus(this.state.ticket.id, this.state.ticket.status)
            .then( () => {
                this.setState({editStatusMode: false})
                this.fetchData()
            })
    }

    handleTicketStatusChange = (e) => {
        this.setState({ticket: Object.assign({}, this.state.ticket, {status: e.target.value})})
    }

    renderUpdateStatus = () => {
        if (this.state.editStatusMode) {
            return (
                  <form>
                    <select value={this.state.ticket.status} onChange={this.handleTicketStatusChange}>
                      {TICKET_STATUSES.map( status => (
                          <option key={ status } value={ status }> { strings.ticket.statuses[status] } </option>
                      ))}
                  </select>
                    <Button
                      onClick={ () => this.updateTicketStatus() }
                      bsSize="xsmall"
                      disabled={ this.state.isUpdatingStatus } >
                      { strings.ticket.submit }
                    </Button>
                  </form>
            )
        }

        return (
            <div>
              <span className={ `ticket-status-${this.state.ticket.status}` } >
                { strings.ticket.statuses[this.state.ticket.status]  }
              </span>&nbsp;
              <Button
                bsSize="xsmall"
                onClick = { () => this.setState({editStatusMode: true})}
                >עדכן</Button>
            </div>
        )
    }

    renderField = (field) => {
        return this.renderTicketInfo(field, this.state.ticket.details[field])
    }

    renderTicketInfo = (name, value) => {
        return (
            <tr>
              <td className="main-column">
                { strings.ticket[name] }
              </td>
              <td className="value-column">
                { value }
              </td>
            </tr>
        )
    }
    render () {
        const user = this.state.ticket.user
        const userDetails =  user ? `${user.firstName} ${user.lastName} (${user.email})` : ''
        const ticketUpdates = this.state.ticket.ticket_updates || []
        return (
            <div>
              <LoadingSpinner show={ this.state.isLoading } />
              <h1>קריאה #{ this.state.ticket.id }</h1>
              <Table className="ticket-view-table" condensed>
                <tbody>
                  { Object.keys(this.state.ticket.details).map( (field) => this.renderField(field) ) }

                  { this.renderTicketInfo('user', userDetails) }
                  { this.renderTicketInfo('dateIssued',  this.formatDate(this.state.ticket.createdAt)) }

                  <tr>
                    <td className="main-column">
                      { strings.ticket.status}
                    </td>
                    <td className="value-column">
                      { this.renderUpdateStatus() }
                    </td>
                  </tr>

                </tbody>
              </Table>

              <hr/>
              <div className="updates">
                <h2>{ strings.ticket.updates } </h2>
                <Form>
                  <Row>
                    <Col sm={10} >
                  <FormControl
                    className="update-text-input"
                    type="text"
                    value={ this.state.newUpdateText }
                    placeholder={ strings.ticket.addUpdate }
                    onChange={ (e) => this.setState({newUpdateText: e.target.value}) } />
                    </Col>
                    <Col sm={2}>
                    <Button
                      className="update-text-button"
                      type="submit"
                      disabled={ this.state.loading }
                      onClick={ this.handleSubmitUpdate }>
                      { strings.ticket.submit }
                    </Button>
                    </Col>
                  </Row>
                </Form>
                { this.state.ticket.ticket_updates.map(this.renderTicketUpdate) }

              </div>
              <hr/>
              <Link to="/admin/tickets">{ strings.back }</Link>

            </div>
        )
    }
}
