import React from "react";

class initCompleted extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          initCompleted: false
        }
        
      }
    updateStateWithInitCompletedTrue = (newState) =>
    {
        this.setState({...newState,initCompleted: true });
    }
    wasInitialized = () =>
    {
        const {initCompleted} = this.state;
        if (initCompleted){
            return true;
        }
        return false;
    }
    renderToCompleteState = () =>
    {
        return <span>Fetching....</span>
    }

    

    render() {
        const {initCompleted} = this.state;
        if(!initCompleted){
          return <span>Fetching....</span>
        }
    }

    
}


export default initCompleted;