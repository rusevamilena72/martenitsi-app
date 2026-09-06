import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile } from '../lib/supabase';

export default function BackgroundProvider({ children }: { children: ReactNode }) {
  const { profile: authProfile } = useAuth();
  const [publicProfile, setPublicProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', 'Nevena Kostova')
        .maybeSingle();

      if (data) {
        setPublicProfile(data);
      }
    };

    fetchPublicProfile();
  }, []);

  const profile = authProfile || publicProfile;

  const backgroundStyle = profile?.background_image_url
    ? {
        backgroundImage: `url('${profile.background_image_url}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {};

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      {children}
    </div>
  );
}
