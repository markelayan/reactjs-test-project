import React from 'react'
import { CFooter } from '@coreui/react'

const TheFooter = () => {
  return (
    <CFooter fixed={false}>
      <div>
      <span className="mr-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">CoreUI for React</a> 
      </div>
      <div className="mfs-auto">
      
        <span className="mr-1"> Developed By</span>
        <a href="https://linkedin.com/in/mark-elayan" target="_blank" rel="noopener noreferrer">Mark Elayan</a>
      </div>
    </CFooter>
  )
}

export default React.memo(TheFooter)
