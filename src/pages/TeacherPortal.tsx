import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TeacherPortal: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [arrears, setArrears] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const isTeacher = user?.roles?.includes('ROLE_TEACHER');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    if (!isTeacher) {
      navigate('/');
      return;
    }
    const fetchSubjects = async () => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/learn/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSubjects(await res.json());
    };
    fetchSubjects();
  }, [isAuthenticated, isTeacher, navigate]);

  const seed = async () => {
    const token = localStorage.getItem('authToken');
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/learn/subjects/seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/learn/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setSubjects(await res.json());
  };

  const submitMetrics = async () => {
    const token = localStorage.getItem('authToken');
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/learn/teacher/metrics/${encodeURIComponent(username)}?cgpa=${encodeURIComponent(cgpa)}&arrears=${encodeURIComponent(arrears)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <div className="container mx-auto p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Seed Electrical Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={seed}>Seed 5 Subjects</Button>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjects.map((s) => (
              <div key={s.id} className="border rounded p-3">
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Student Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Student Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="student_username" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">CGPA</label>
              <Input type="number" step="0.01" value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="e.g., 7.8" />
            </div>
            <div>
              <label className="block text-sm mb-1">No. of arrears</label>
              <Input type="number" value={arrears} onChange={(e) => setArrears(e.target.value)} placeholder="e.g., 1" />
            </div>
          </div>
          <Button onClick={submitMetrics}>Submit</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherPortal;


