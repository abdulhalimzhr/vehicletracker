import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vehicleApi, reportApi } from '../lib/api'
import { formatDateTime, formatDuration, downloadBlob } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { ArrowLeft, Download, Calendar } from 'lucide-react'

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [isDownloading, setIsDownloading] = useState(false)

  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleApi.getById(id!),
    enabled: !!id,
  })

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['vehicle-status', id, selectedDate],
    queryFn: () => vehicleApi.getStatus(id!, selectedDate),
    enabled: !!id && !!selectedDate,
  })

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true)
      const response = await reportApi.downloadVehicleReport({
        vehicleId: id,
        startDate: selectedDate,
        endDate: selectedDate,
      })
      const filename = `vehicle-${vehicle?.data.plateNumber}-${selectedDate}.xlsx`
      downloadBlob(response.data, filename)
    } catch (error) {
      console.error('Failed to download report:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  if (vehicleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading vehicle details...</div>
      </div>
    )
  }

  const vehicleData = vehicle?.data
  const status = statusData?.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {vehicleData?.brand} {vehicleData?.model}
          </h1>
        </div>
        <Button
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>{isDownloading ? 'Downloading...' : 'Download Report'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Plate Number</span>
              <p className="text-lg font-semibold">{vehicleData?.plateNumber}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Brand & Model</span>
              <p>{vehicleData?.brand} {vehicleData?.model}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Year</span>
              <p>{vehicleData?.year}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Color</span>
              <p>{vehicleData?.color}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Select Date</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="text-sm text-gray-500">Loading status...</div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Trip</span>
                  <span className="font-medium text-green-600">
                    {formatDuration(status?.summary.TRIP || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Idle</span>
                  <span className="font-medium text-yellow-600">
                    {formatDuration(status?.summary.IDLE || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Stopped</span>
                  <span className="font-medium text-red-600">
                    {formatDuration(status?.summary.STOPPED || 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip History - {selectedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="text-center py-8 text-gray-500">Loading trips...</div>
          ) : status?.trips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No trips found for this date
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {status?.trips.map((trip: any) => {
                    const duration = trip.endTime
                      ? Math.round((new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()) / 1000 / 60)
                      : 0

                    return (
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              trip.status === 'TRIP'
                                ? 'bg-green-100 text-green-800'
                                : trip.status === 'IDLE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(trip.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trip.endTime ? formatDateTime(trip.endTime) : 'Ongoing'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {duration > 0 ? formatDuration(duration) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trip.address || 'N/A'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}