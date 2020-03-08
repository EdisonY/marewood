import React from 'react';
import {CircularProgress, IconButton, Tooltip} from "@material-ui/core";

const STATUS = ["我要闲出病来了","我太难了，非常忙"];

class RepositoryJobStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state ={}
    }
    renderCircularProgress(status){
        if (1 === status) return (<CircularProgress size={20} color="secondary" />);
        return (<CircularProgress variant="static" value={100} size={20}/>);
    }
    render() {
        return (
            <div>
                <Tooltip title={STATUS[this.props.status]}>
                    <IconButton  color="primary">
                        {this.renderCircularProgress(this.props.status)}
                    </IconButton>
                </Tooltip>
            </div>
        );
    }
}


export default RepositoryJobStatus
