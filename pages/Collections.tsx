import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Collection, AppFile } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import FileCard from '../components/FileCard';
import { CollectionIcon } from '../components/layout/icons/Icons';
import Skeleton from '../components/ui/Skeleton';

interface CollectionsProps {
    onFileSelect: (file: AppFile) => void;
}

const Collections: React.FC<CollectionsProps> = ({ onFileSelect }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filesByCollection, setFilesByCollection] = useState<Record<string, AppFile[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedCollections = await api.getCollections();
        setCollections(fetchedCollections);

        const filesData: Record<string, AppFile[]> = {};
        for (const collection of fetchedCollections) {
          filesData[collection.id] = await api.getFilesByIds(collection.file_ids);
        }
        setFilesByCollection(filesData);
      } catch (error) {
        console.error("Failed to fetch collections data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <CollectionIcon size={32} className="text-primary"/>
                <h1 className="text-3xl font-bold text-text-high">Collections</h1>
            </div>
            <div className="space-y-10">
                {[...Array(2)].map((_, i) => (
                    <div key={i}>
                        <Skeleton className="h-7 w-1/3 mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(2)].map((_, j) => <Skeleton key={j} className="h-56 w-full" />)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <CollectionIcon size={32} className="text-primary"/>
        <h1 className="text-3xl font-bold text-text-high">Collections</h1>
      </div>
      
      {collections.length === 0 ? (
        <Card>
            <CardContent className="pt-6 text-center">
                <p className="text-text-mid">You haven't created any collections yet.</p>
                <p className="text-sm text-text-low mt-1">Select files in your vault to group them into a collection.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {collections.map(collection => (
            <div key={collection.id}>
              <h2 className="text-xl font-bold text-text-high mb-4">{collection.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(filesByCollection[collection.id] || []).map(file => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    onSelect={onFileSelect}
                    isSelected={false}
                    onToggleSelection={() => {}}
                    isSelectionActive={false}
                  />
                ))}
              </div>
              {(filesByCollection[collection.id] || []).length === 0 && (
                <p className="text-text-mid">This collection is empty.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Collections;