import { useEffect, useState } from "react"
import { Button } from "@blueprintjs/core"
import { isMobile } from "react-device-detect"
import mainURL from "../utils/CONST"

// Hate this component :-( I was in a hurry to do it faster
// A lot of things could be optimized here and you could take out individual pieces of reused code ...

export default function Products() {

    // All states, maby i shoud use State management
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [itemCount, setItemCount] = useState(null)

    // If we use mobile device its turn range to 0...5, but have some trouble with dyamic
    const [pagesRange, setPagesRange] = useState(isMobile ?
        {
            start: 0,
            end: 5
        } 
        :
        {
            start: 0,
            end: 20
        }    
    )

    const [queryParams, setQueryParams] = useState({
        page: 0,
        limit: 10
    })
    const [currentPage, setCurrentPage] = useState(null)

    useEffect(() => {

        // Get count of items
        async function getCount() {
            //Activate Loader
            setLoading(true)
            const response = await fetch(`${mainURL}/api/v1/content/total`, {
                method: "get",
                headers: {'x-access-token': `${localStorage.getItem('access_token')}`}
            })

            const count = await response.json()
            
            setItemCount(count.result.count)
            setLoading(false)
        }

        // Async get data from server with saving to state
        async function getData() {
            const response = await fetch(`${mainURL}/api/v1/content?page=${queryParams.page}&limit=${queryParams.limit}`, {
                method: "get",
                headers: {'x-access-token': `${localStorage.getItem('access_token')}`}
            })
        
            const json = await response.json()
            // Save data to state
            setData(json.result)
        }
        
        // Refresh token query, 100% this need to rewrite (one function with different endpoints)
        // Export/import refrech request need to ...
        getCount()
            .catch(err => {
                fetch(`${mainURL}/api/v1/refresh`, {
                    method: 'POST',
                    headers: {'x-access-token': `${localStorage.getItem('refresh_token')}`}
                })
                .then(response => {
                    localStorage.setItem('access_token', response.result.access_token)
                    localStorage.setItem('refresh_token', response.result.refresh_token)
                    getCount()
                })
            })
        getData()
            .catch(err => {
                fetch(`${mainURL}/api/v1/refresh`, {
                    method: 'POST',
                    headers: {'x-access-token': `${localStorage.getItem('refresh_token')}`}
                })
                .then(response => {
                    localStorage.setItem('access_token', response.result.access_token)
                    localStorage.setItem('refresh_token', response.result.refresh_token)
                    getData()
                })
            })
    }, [queryParams])
    
    //Array just to get all pages from a ... z
    let allPages = []
    for (let i = 0; i <= (itemCount/10); i++) {
        allPages.push(i)
    }

    // Paginate component
    function Pagination() {
        return (
            <ul style={{display: 'flex', padding: 0, margin: 0}}>
                {/* Render only pages from range start to end (0 ... 10) */}
                {allPages.slice(pagesRange.start, pagesRange.end).map(item => (
                    <li 
                        key={item} 
                        className='list_item'
                        // set page to get our list items
                        onClick={() => {setQueryParams({page: item, limit: queryParams.limit})}}
                        // Highlight the current page in color
                        style={item == queryParams.page ? 
                            {
                                listStyle: 'none', 
                                margin: '0 5px', 
                                padding: '0 5px',
                                background: 'red',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center'
                            } 
                            :
                            {
                                listStyle: 'none', 
                                margin: '0 5px', 
                                padding: '0 5px',
                                display: 'flex',
                                alignItems: 'center'
                            }    
                        }
                    >{item}</li>
                ))}
            </ul>
        )
    }

    return (
        <div>
            {/* Loader functional */}
            <div className="lds-dual-ring" style={loading ? {display: 'block'} : {display: 'none'}}></div>
            {loading ? 
                '' 
                : 
                <div className="content__mainContainer" style={{width: '70%', margin: 'auto'}}>
                <h1 style={{marginLeft: '10px'}}>Контент</h1>
                <ul style={{
                        display: 'flex', 
                        width: '100%', 
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        padding: 0
                    }}>
                    {/* Render list items */}
                    {data.map(item => (
                        <li 
                            key={item._id}
                            className='list__item'
                            style={{
                                listStyle: 'none',
                                border: '1px solid black',
                                margin: '10px',
                                height: '100px',
                                width: '30%',
                                padding: '10px'
                            }}
                        >{item.name}<br />Item</li>
                    ))}
                </ul>

                <p>Всего контента {itemCount}</p>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>

                    {/* The most terrible piece of code. It should be reused ... */}
                    <Button onClick={() => {
                        setPagesRange({start: 0, end: 10})
                        setQueryParams({page: 0, limit: 10})
                    }}
                        disabled={queryParams.page == 0 ? 'disabled' : null}
                    >Начало</Button>

                    <Button onClick={() => {
                        setPagesRange({start: pagesRange.start - 10, end: pagesRange.end - 10})
                        setQueryParams({page: queryParams.page - 10, limit: queryParams.limit})
                    }}
                        disabled={queryParams.page < 10 ? 'disabled' : null}
                    >{'<<'}</Button>

                    <Button onClick={() => {
                        setPagesRange({start: pagesRange.start - 1, end: pagesRange.end - 1})
                        setQueryParams({page: queryParams.page - 1, limit: queryParams.limit})
                    }}>{'<'}</Button>

                    <Pagination />
                    
                    <Button onClick={() => {
                        setPagesRange({start: pagesRange.start + 1, end: pagesRange.end + 1})
                        setQueryParams({page: queryParams.page + 1, limit: queryParams.limit})
                    }}>{'>'}</Button>

                    <Button onClick={() => {
                        setPagesRange({start: pagesRange.start + 10, end: pagesRange.end + 10})
                        setQueryParams({page: queryParams.page + 10, limit: queryParams.limit})
                    }}
                        disabled={queryParams.page > allPages.length - 12 ? 'disabled' : null}
                    >{'>>'}</Button>

                    <Button onClick={() => {
                        setPagesRange({start: allPages.length-11, end: allPages.length-1})
                        setQueryParams({page: allPages.length - 2, limit: 10})
                        setCurrentPage(allPages.length - 2)
                    }}
                        disabled={queryParams.page == currentPage ? 'disabled' : null}
                    >Конец</Button>

                </div>
            </div>
            }
        </div>
    )
}