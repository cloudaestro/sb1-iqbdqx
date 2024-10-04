import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('your_stripe_publishable_key')

interface Invoice {
  id: string
  amount: number
  status: 'pending' | 'paid'
  createdAt: string
  studentName: string
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [newInvoice, setNewInvoice] = useState({
    amount: '',
    studentId: '',
  })
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
    fetchStudents()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('/api/invoices')
      setInvoices(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setError('Failed to fetch invoices. Please try again later.')
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students')
      setStudents(Array.isArray(response.data) ? response.data.map((student: any) => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
      })) : [])
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to fetch students. Please try again later.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewInvoice((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/invoices', newInvoice)
      setNewInvoice({ amount: '', studentId: '' })
      fetchInvoices()
    } catch (error) {
      console.error('Error creating invoice:', error)
      setError('Failed to create invoice. Please try again.')
    }
  }

  const handlePayment = async (invoiceId: string) => {
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      const response = await axios.post(`/api/invoices/${invoiceId}/pay`)
      const { sessionId } = response.data

      const result = await stripe.redirectToCheckout({ sessionId })
      if (result.error) {
        console.error(result.error.message)
        setError('Payment processing failed. Please try again.')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setError('Payment processing failed. Please try again.')
    }
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount ($)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newInvoice.amount}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student</label>
              <select
                id="studentId"
                name="studentId"
                value={newInvoice.studentId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
              Create Invoice
            </button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Invoice List</h2>
          {invoices.length === 0 ? (
            <p>No invoices found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <li key={invoice.id} className="py-4">
                  <p className="text-sm font-medium text-gray-900">${invoice.amount.toFixed(2)} - {invoice.studentName}</p>
                  <p className="text-sm text-gray-500">Status: {invoice.status}</p>
                  <p className="text-sm text-gray-500">Created: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                  {invoice.status === 'pending' && (
                    <button
                      onClick={() => handlePayment(invoice.id)}
                      className="mt-2 bg-green-500 text-white py-1 px-3 rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      Pay Now
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Invoices