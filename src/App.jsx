import { useState, useEffect } from 'react'
import { API_ENDPOINTS, API_HEADERS } from './config/api'

function App() {
  const [species, setSpecies] = useState([])
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [assemblyData, setAssemblyData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch species data on component mount
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_ENDPOINTS.SPECIES, {
          headers: API_HEADERS
        })
        const data = await response.json()
        
        // Filter species that have 'variation' in their groups
        const variationSpecies = data.species.filter(sp => 
          sp.groups && sp.groups.includes('variation')
        )
        
        // Sort species alphabetically by display name
        const sortedSpecies = variationSpecies.sort((a, b) => 
          a.display_name.localeCompare(b.display_name)
        )
        
        setSpecies(sortedSpecies)
      } catch (err) {
        setError('Failed to fetch species data')
        console.error('Error fetching species:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSpecies()
  }, [])
  // Fetch assembly data when a species is selected
  const handleSpeciesChange = async (event) => {
    const speciesName = event.target.value
    setSelectedSpecies(speciesName)
    
    if (!speciesName) {
      setAssemblyData(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setAssemblyData(null) // Clear previous data when starting new request
      const response = await fetch(API_ENDPOINTS.ASSEMBLY(speciesName), {
        headers: API_HEADERS
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch assembly data')
      }
      
      const data = await response.json()
      setAssemblyData(data)
    } catch (err) {
      setError('Failed to fetch assembly data')
      console.error('Error fetching assembly:', err)
    } finally {
      setLoading(false)
    }
  }

  // Format chromosome data for display
  const getFormattedChromosomes = () => {
    if (!assemblyData || !assemblyData.top_level_region) return []
    
    // Filter for chromosomes only 
    const chromosomes = assemblyData.top_level_region.filter(region => 
      region.coord_system === 'chromosome'
    )
    
    // Sort chromosomes in karyotype order if available, otherwise natural sort
    const karyotypeOrder = assemblyData.karyotype || []
    
    return chromosomes.sort((a, b) => {
      const aIndex = karyotypeOrder.indexOf(a.name)
      const bIndex = karyotypeOrder.indexOf(b.name)
      return aIndex - bIndex
    })
  }

  // Calculate total length
  const getTotalLength = () => {
    if (!assemblyData || !assemblyData.top_level_region) return 0
    
    const chromosomes = assemblyData.top_level_region.filter(region => 
      region.coord_system === 'chromosome'
    )
    
    return chromosomes.reduce((total, chr) => total + chr.length, 0)
  }

  // Format base pairs with appropriate units
  const formatLength = (length) => {
    if (length < 1000000) {
      return `${(length / 1000).toFixed(2)} Kb`
    } else {
      return `${(length / 1000000).toFixed(2)} Mb`
    }
  }

  // Get display name for selected species
  const getSelectedSpeciesDisplayName = () => {
    if (!selectedSpecies) return ''
    const speciesInfo = species.find(sp => sp.name === selectedSpecies)
    return speciesInfo ? speciesInfo.display_name : selectedSpecies
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Species Assembly Summaries
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 flex items-center gap-4">
            <label htmlFor="species-select" className="text-sm font-medium text-gray-700 whitespace-nowrap cursor-pointer">
              Species
            </label>
            <select
              id="species-select"
              value={selectedSpecies}
              onChange={handleSpeciesChange}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer disabled:cursor-not-allowed"
              disabled={loading}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">Select a species...</option>
              {species.map(sp => (
                <option key={sp.name} value={sp.name} className="cursor-pointer">
                  {sp.display_name}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {assemblyData && selectedSpecies && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {getSelectedSpeciesDisplayName()}
              </h2>
              
              <div className="mb-4 text-sm text-gray-600">
                <strong>Total Length:</strong> {getTotalLength()} bp
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <tbody className="divide-y divide-gray-200">
                    {getFormattedChromosomes().map((chromosome, index) => (
                      <tr 
                        key={chromosome.name} 
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {chromosome.name === 'MT' ? 'MT' : chromosome.name}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {formatLength(chromosome.length)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
