import React from 'react'

const page = ({ params }) => {
    let {id} = params
  return (
    <div>
        <h1>this is product details for ID: {id}</h1>
    </div>
  )
}

export default page