import React, { useState, useEffect } from 'react';
import { ChevronDown, User, MapPin, Clock, Star, X, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

// Interface untuk data dokter
interface Doctor {
  id: number;
  name: string;
  category: DoctorCategory;
  location: string;
  schedule: string;
  rating: number;
  price: string;
  image?: string;
  specialty?: string;
  experience?: number;
}

// Interface untuk jadwal dokter
interface DoctorSchedule {
  date: string;
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  price: string;
  slotId: string;
}

// Interface untuk data booking yang akan dikirim ke API
interface BookingPayload {
  doctorId: number;
  date: string;
  time: string;
  slotId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  notes?: string;
}

// Tipe untuk kategori dokter
type DoctorCategory = 'UMUM' | 'GIGI' | 'MATA' | 'KULIT' | 'JANTUNG' | 'ANAK';

// Props untuk komponen
interface DoctorListAppProps {
  baseApiUrl?: string;
}

const DoctorListApp: React.FC<DoctorListAppProps> = ({ baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/v1' }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk modal jadwal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);
  
  // State untuk booking
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<{date: string, time: string, price: string, slotId: string} | null>(null);
  const [bookingData, setBookingData] = useState<Partial<BookingPayload>>({});
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const categories: string[] = ['Semua', 'UMUM', 'GIGI', 'MATA', 'KULIT', 'JANTUNG', 'ANAK'];

  // Simulasi pemanggilan API
  const fetchDoctors = async (): Promise<Doctor[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseApiUrl}/doctors`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch doctors');
      }
      
      return result.data;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch jadwal dokter
  const fetchDoctorSchedule = async (doctorId: number): Promise<DoctorSchedule[]> => {
    setScheduleLoading(true);
    
    try {
      const response = await fetch(`${baseApiUrl}/doctors/${doctorId}/schedule`);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch schedule');
      }
      
      return result.data;
      
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      return [];
    } finally {
      setScheduleLoading(false);
    }
  };

  // Submit booking
  const submitBooking = async (bookingData: BookingPayload): Promise<boolean> => {
    setBookingLoading(true);
    setBookingError(null);
    
    try {
      const response = await fetch(`${baseApiUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to create booking');
      }
      
      return true;
      
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to create booking');
      return false;
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors().then(data => {
      setDoctors(data);
      setFilteredDoctors(data);
    });
  }, [baseApiUrl]);

  useEffect(() => {
    if (selectedCategory === 'Semua') {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter(doctor => doctor.category === selectedCategory));
    }
  }, [selectedCategory, doctors]);

  const handleCategoryChange = (category: string): void => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const handleViewSchedule = async (doctor: Doctor): Promise<void> => {
    setSelectedDoctor(doctor);
    setIsScheduleModalOpen(true);
    const schedules = await fetchDoctorSchedule(doctor.id);
    setDoctorSchedules(schedules);
  };

  const handleBookingClick = (date: string, time: string, price: string, slotId: string): void => {
    setSelectedSchedule({ date, time, price, slotId });
    setBookingData({
      doctorId: selectedDoctor?.id,
      date,
      time,
      slotId,
    });
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!bookingData.patientName || !bookingData.patientPhone || !bookingData.patientEmail) {
      setBookingError('Mohon lengkapi semua data yang diperlukan');
      return;
    }
    
    const success = await submitBooking(bookingData as BookingPayload);
    if (success) {
      setBookingSuccess(true);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setIsScheduleModalOpen(false);
        setBookingSuccess(false);
        setBookingData({});
        setSelectedSchedule(null);
        // Refresh jadwal untuk update slot availability
        if (selectedDoctor) {
          fetchDoctorSchedule(selectedDoctor.id).then(setDoctorSchedules);
        }
      }, 2000);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data dokter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => fetchDoctors()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header dengan Filter */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-sm mx-auto lg:max-w-md">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg flex items-center justify-between hover:bg-emerald-700 transition-colors shadow-md"
            >
              <span className="font-medium">Dokter {selectedCategory}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedCategory === category 
                        ? 'bg-emerald-50 text-emerald-700 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    Dokter {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Container Utama */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Grid Dokter Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Gambar Dokter */}
              <div className="h-32 sm:h-36 lg:h-40 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center relative">
                {doctor.image ? (
                  <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 lg:w-14 lg:h-14 text-emerald-600" />
                )}
                
                {/* Badge Rating */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-xs font-medium text-gray-700">{doctor.rating}</span>
                </div>
              </div>
              
              {/* Info Dokter */}
              <div className="p-3 lg:p-4">
                <h3 className="font-semibold text-sm lg:text-base text-gray-800 mb-1 lg:mb-2 line-clamp-2 leading-tight">
                  {doctor.name}
                </h3>
                
                {doctor.specialty && (
                  <p className="text-xs lg:text-sm text-emerald-600 font-medium mb-2">
                    {doctor.specialty}
                  </p>
                )}
                
                <div className="flex items-start text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">
                  <MapPin className="w-3 h-3 lg:w-4 lg:h-4 mr-1 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{doctor.location}</span>
                </div>
                
                <div className="flex items-start text-xs lg:text-sm text-gray-600 mb-2 lg:mb-3">
                  <Clock className="w-3 h-3 lg:w-4 lg:h-4 mr-1 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{doctor.schedule}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs lg:text-sm mb-3 lg:mb-4">
                  {doctor.experience && (
                    <span className="text-gray-500">{doctor.experience} tahun</span>
                  )}
                  <span className="font-bold text-emerald-700">{doctor.price}</span>
                </div>
                
                {/* Tombol Lihat Jadwal */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewSchedule(doctor)}
                    className="flex-1 bg-emerald-500 text-white text-xs lg:text-sm py-2 px-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  >
                    Lihat Jadwal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDoctors.length === 0 && !loading && (
          <div className="text-center py-12 lg:py-16">
            <User className="w-16 h-16 lg:w-20 lg:h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-medium text-gray-700 mb-2">Tidak Ada Dokter</h3>
            <p className="text-gray-500 text-sm lg:text-base">Tidak ada dokter untuk kategori {selectedCategory}</p>
          </div>
        )}
      </div>

      {/* Modal Jadwal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Jadwal Praktik</h2>
                  <p className="text-gray-600">{selectedDoctor?.name}</p>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {scheduleLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Memuat jadwal...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctorSchedules.map((schedule, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
                        {formatDate(schedule.date)}
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {schedule.timeSlots.map((slot, slotIndex) => (
                          <button
                            key={slotIndex}
                            onClick={() => slot.available && handleBookingClick(schedule.date, slot.time, slot.price, slot.slotId)}
                            disabled={!slot.available}
                            className={`p-2 text-sm rounded-lg border transition-colors ${
                              slot.available
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Booking */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Booking Konsultasi</h2>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Booking Berhasil!</h3>
                  <p className="text-gray-600">Booking Anda telah dikonfirmasi.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Info Booking */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Detail Booking</h4>
                    <p className="text-sm text-gray-600">Dokter: {selectedDoctor?.name}</p>
                    <p className="text-sm text-gray-600">Tanggal: {selectedSchedule && formatDate(selectedSchedule.date)}</p>
                    <p className="text-sm text-gray-600">Waktu: {selectedSchedule?.time}</p>
                    <p className="text-sm font-semibold text-emerald-600">Biaya: {selectedSchedule?.price}</p>
                  </div>

                  {/* Form Data Pasien */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingData.patientName || ''}
                      onChange={(e) => setBookingData({...bookingData, patientName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon *
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingData.patientPhone || ''}
                      onChange={(e) => setBookingData({...bookingData, patientPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={bookingData.patientEmail || ''}
                      onChange={(e) => setBookingData({...bookingData, patientEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={bookingData.notes || ''}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Keluhan atau catatan tambahan..."
                    />
                  </div>

                  {bookingError && (
                    <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">{bookingError}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      onClick={handleBookingSubmit}
                      disabled={bookingLoading}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {bookingLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        'Konfirmasi Booking'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorListApp;