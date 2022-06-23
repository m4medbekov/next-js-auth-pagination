import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import mainURL from '../utils/CONST';
import { Button, Dialog, FormGroup, InputGroup, Label } from '@blueprintjs/core'
import React from 'react';
import Router from 'next/router';

export default function Home() {

  // State for store data, form server
  const [authData, setAuthData] = useState({
    email: '',
    password: ''
  })

  // Async login saving tokens to localStorage
  async function login(email, password) {
    const response = await fetch(`${mainURL}/api/v1/login`, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    if (response.status == 401) {
      alert('email введен не верно')
    } else {
      const json = await response.json()

      // Saving tokens to localStorage
      localStorage.setItem('access_token', json.result.access_token)
      localStorage.setItem('refresh_token', json.result.refresh_token)

      Router.push('/products')
    }
 
  }

  // Control component
  function handleChange(e) {
    setAuthData({
      ...authData,
      [e.target.name]: e.target.value
    })
  }

  function handleClick(e) {
    login(authData.email, authData.password)
  }

  return (
    // Don`t know why, but without StrictMode not work
    <React.StrictMode>
      <div className={styles.container}>
        <Dialog 
          isOpen={true} 
          title='Вход' 
          isCloseButtonShown={false} 
          style={{
            width: '300px',
            margin: '200px auto 0 auto',
            border: '1px solid black',
            borderRadius: '10px',
            padding: '22px'
          }}
        >
          <FormGroup>
            <Label>
              email
              <InputGroup 
                type='email' 
                name='email' 
                value={authData.email} 
                onChange={handleChange}
                placeholder='email'
                style={{
                  width: '100%',
                  height: '35px',
                  borderRadius: '6px',
                  marginTop: '5px'
                }}
              />
            </Label>
            <Label>
              Пароль
              <InputGroup 
                type='password' 
                name='password' 
                value={authData.password} 
                onChange={handleChange}
                placeholder='Пароль'
                style={{
                  width: '100%',
                  height: '35px',
                  borderRadius: '6px',
                  marginTop: '5px'
                }}
              />
            </Label>
            <Button 
              type='submit' 
              onClick={handleClick} 
              style={{
                marginTop: '20px',
                width: '100%',
                height: '35px',
                borderRadius: '6px'
              }}
            >Вход</Button>
          </FormGroup>
        </Dialog>
      </div>
    </React.StrictMode>
  )
}
