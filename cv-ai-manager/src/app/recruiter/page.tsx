"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, ArrowDownAZ, Clock } from 'lucide-react';
import api from '@/services/api';
import { CandidateMatch, CandidateProfile } from '@/types';
import SkeletonCard from '@/components/skeletons/SkeletonCard';
import CandidateDetailModal from '@/components/modals/CandidateDetailModal';
import CandidateCard from '@/components/cards/CandidateCard';
import CandidateListItem from '@/components/cards/CandidateListItem';

const RecruiterPage = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [ingestedProfiles, setIngestedProfiles] = useState<CandidateProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  // State to control the sorting of the cards
  const [sortBy, setSortBy] = useState<'match' | 'recent'>('match');

  useEffect(() => {
    const fetchIngestedProfiles = async () => {
      try {
        const userId = '12345'; // TODO: replace with real user ID
        const response = await api.get(`/api/v1/candidates?userId=${userId}&page=0&size=20`);
        setIngestedProfiles(response.data.content);
      } catch (error) {
        toast.error('Could not load candidate profiles.');
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    fetchIngestedProfiles();
  }, []);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description.');
      return;
    }
    setIsSearching(true);
    setMatches([]);

    toast.promise(
      api.post('/api/v1/recruitment/match', { jobDescription }),
      {
        loading: 'Searching for the best candidates...',
        success: (response) => {
          setMatches(response.data);
          setIsSearching(false);
          // Reset the filter when making a new search
          setSortBy('match');
          return response.data.length > 0
            ? `Found ${response.data.length} candidates.`
            : 'No candidates found for this description.';
        },
        error: (err) => {
          setIsSearching(false);
          return err.response?.data?.message || 'An error occurred during the search.';
        },
      }
    );
  };

  // Logic to dynamically sort the cards
  const sortedMatches = [...matches].sort((a, b) => {
    if (sortBy === 'match') {
      return b.similarityScore - a.similarityScore; // Highest percentage first
    } else {
      // Since Mongo IDs have a timestamp embedded, sorting them alphabetically in reverse gives us the most recent
      return b.profile.id.localeCompare(a.profile.id);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Recruiter Dashboard</h1>

        {/* Search Section */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">AI Semantic Search</h2>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="w-full p-4 pr-12 text-gray-700 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Paste the Job Description (JD) here to find the best matching candidates in your database..."
              />
              <button
                type="submit"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                disabled={isSearching}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {matches.length > 0 && (
          <div className="mb-12 animate-fadeIn">
            {/* Results Header with Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                Top Matches <span className="ml-3 bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded-full">{matches.length} found</span>
              </h2>
              
              {/* UI/UX Sorting Buttons */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSortBy('match')}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    sortBy === 'match' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ArrowDownAZ className="w-4 h-4 mr-2" /> Highest Match
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    sortBy === 'recent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" /> Most Recent
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isSearching && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
              
              {!isSearching && sortedMatches.map((match) => (
                <CandidateCard 
                  key={match.profile.id} 
                  match={match} 
                  onClick={setSelectedCandidateId} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Ingested Profiles Panel */}
        <div>
           <h2 className="text-xl font-bold mb-4 text-gray-800">Talent Database</h2>
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             
             {isLoadingProfiles && (
               <div className="p-8 flex flex-col items-center justify-center text-gray-500 animate-pulse">
                 <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                 <p>Syncing database...</p>
               </div>
             )}
             
             {!isLoadingProfiles && ingestedProfiles.length === 0 && (
               <div className="p-12 text-center">
                 <p className="text-gray-500 mb-2">No profiles currently indexed in the system.</p>
                 <p className="text-sm text-gray-400">Profiles will appear here as candidates upload their CVs.</p>
               </div>
             )}
             
             <ul className="divide-y divide-gray-100">
               {/* List of candidates */}
               {ingestedProfiles.map(profile => (
                  <CandidateListItem 
                    key={profile.id} 
                    profile={profile} 
                    onClick={setSelectedCandidateId} 
                  />
               ))}
             </ul>
             
           </div>
        </div>
      </div>

      {/* Modal Render */}
      {selectedCandidateId && (
        <CandidateDetailModal 
          candidateId={selectedCandidateId} 
          onClose={() => setSelectedCandidateId(null)} 
        />
      )}
    </div>
  );
};

export default RecruiterPage;