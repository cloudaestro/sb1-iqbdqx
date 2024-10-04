import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Resource {
  id: string
  title: string
  description: string
  fileUrl: string
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [newResource, setNewResource] = useState<Omit<Resource, 'id' | 'fileUrl'>>({
    title: '',
    description: '',
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await axios.get('/api/resources')
      setResources(response.data)
    } catch (error) {
      console.error('Error fetching resources:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewResource((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('title', newResource.title)
    formData.append('description', newResource.description)
    formData.append('file', file)

    try {
      await axios.post('/api/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setNewResource({ title: '', description: '' })
      setFile(null)
      fetchResources()
    } catch (error) {
      console.error('Error adding resource:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Resources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Resource</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newResource.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={newResource.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows={3}
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">File</label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="mt-1 block w-full"
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
              Add Resource
            </button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Resource List</h2>
          <ul className="divide-y divide-gray-200">
            {resources.map((resource) => (
              <li key={resource.id} className="py-4">
                <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                <p className="text-sm text-gray-500">{resource.description}</p>
                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800">
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Resources