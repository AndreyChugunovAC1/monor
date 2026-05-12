import type { Mot } from '../types/types'

export function useMots() {
  const addMot = async (mot: Mot) => {
    const response = await fetch('/api/mots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')!}`
      },
      body: JSON.stringify({
        title: mot.title,
        descr: mot.descr,
        asi: mot.asi
      })
    })
    if (response.ok) {
      const data = await response.json()
      mot.id = data.id
    }
  }

  const updateMot = async (id: number, mot: Mot) => {
    const response = await fetch(`/api/mots/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')!}`
      },
      body: JSON.stringify({
        title: mot.title,
        descr: mot.descr,
        asi: mot.asi
      })
    })
  }

  const getMots = async (): Promise<Mot[]> => {
    const response = await fetch('/api/mots', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.mots
    }
    return []
  }

  const getMot = async (id: number): Promise<Mot> => {
    const response = await fetch(`/api/mots/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    const data = await response.json()
    return data.mot
  }

  const deleteMot = async (id: number) => {
    await fetch(`/api/mots/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')!}`
      }
    })
  }

  return {
    addMot,
    updateMot,
    deleteMot,
    getMots,
    getMot
  }
}