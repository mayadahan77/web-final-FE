import 'bootstrap/dist/css/bootstrap.css'

function PostsList() {
  const items = ["item 1", "item 2", "item 3"]
  return (
    <div>
      <h1>Posts List:</h1>
      {items.map((item, index) => (
        <li className='list-group-item' key={index}>{index} {item}</li>))}
    </div>
  )
}

export default PostsList