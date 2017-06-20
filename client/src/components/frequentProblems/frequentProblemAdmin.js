import React from 'react'
import { Table, Button, Glyphicon } from 'react-bootstrap'

import LoadingSpinner from '../loadingSpinner.js'
import { getFrequentProblemsList } from '../../api'
import Strings from '../../strings'
import EditFrequentProblem from './editFrequentProblem'
import { updateFrequentProblem } from '../../api'
const FIELDS = ['env', 'subEnv', 'subject', 'solution', 'solutionURL']
export default class FrequentProblemAdmin extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            isLoading: true,
            editedProblem: {},
            editing: false,
            frequentProblems: []
        }
    }

    fetchData() {
        this.setState({
            isLoading: true
        })
        getFrequentProblemsList()
            .then( frequentProblems => {
                this.setState({
                    isLoading: false,
                    frequentProblems
                })
            })
    }

    componentDidMount() {
        this.fetchData()
    }

    editProblem = (problem) => {
        console.log('<-DANDEBUG-> frequentProblemAdmin.js\\ 37: problem:', problem);
    }

    renderFrequentProblem = (problem) => {
        const rows = FIELDS.map( field => (
            <td key={ field }>
              { problem[field]}
            </td>))

        return (
              <tr>
                <td>
                  <Button
                    bsSize="xsmall"
                    onClick={ () => this.setState({
                        editedProblem: problem,
                        editing: true})
                    } >
                    <Glyphicon glyph="pencil" />
                  </Button>
                </td>
                { rows }
              </tr>
        )
    }

    handleSubmit = (fields) => {
        this.setState({
            isLoading: true,
            editing: false
        })
        updateFrequentProblem(this.state.editedProblem.id, fields)
            .then( () => {
                this.fetchData()
            })
    }

    render () {
        const headers = FIELDS.map( field => (
            <th key={ field } >
              { Strings.frequentProblems.admin.fields[field] }
            </th>
        ))

        return (
            <div>
              <LoadingSpinner show={ this.state.isLoading } />
              <h1>{ Strings.frequentProblems.header }</h1>
              <h2>{ Strings.frequentProblems.admin.edit }</h2>

              <Table striped bordered hover compact className="align-right" >
                <thead>
                  <tr>
                    <th></th>
                    { headers }
                  </tr>
                </thead>
                <tbody>
                  { this.state.frequentProblems.map(this.renderFrequentProblem) }
                </tbody>
              </Table>
              <EditFrequentProblem
                fields={ FIELDS }
                problem={ this.state.editedProblem }
                onHide={ () => this.setState({ editing: false } ) }
                onSubmit={ this.handleSubmit }
                show={ this.state.editing }/>
            </div>
        )
    }
}
