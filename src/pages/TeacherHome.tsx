import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Pencil, Plus, Users, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';

interface StudentProfile {
  id: string;
  username: string;
  cgpa: number;
  numArrears: number;
  interestedSubjectIds: string[];
  firstName?: string;
  lastName?: string;
  presentClass?: string;
  department?: string;
  semester?: number;
  contactEmail?: string;
  notes?: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
}

const TeacherHome: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    cgpa: '',
    numArrears: '',
    presentClass: '',
    department: '',
    semester: '',
    contactEmail: '',
    notes: '',
  });

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
    fetchData();
  }, [isAuthenticated, isTeacher, navigate]);

  const [lookupError, setLookupError] = React.useState<string | null>(null);

  async function fetchData() {
    try {
      const token = localStorage.getItem('authToken');

      // Fetch students (this endpoint might need to be created in backend)
      const studentsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/learn/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let localStudents: StudentProfile[] = [];
      if (studentsRes.ok) {
        localStudents = await studentsRes.json();
        setStudents(localStudents);
      }

  // Fetch platform users so teachers can see available users even if no StudentProfile exists
      const usersRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/learn/teacher/available-students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usersRes.ok) {
        const users: Array<{ username: string; firstName?: string; lastName?: string; email?: string }> = await usersRes.json();
        // merge users that might not be in student profiles into the students list
        const extra = users
          .filter((u) => !localStudents.find(s => s.username === u.username))
          .map((u) => ({ id: u.username, username: u.username, cgpa: 0, numArrears: 0, interestedSubjectIds: [], firstName: u.firstName, lastName: u.lastName, presentClass: '', department: '', semester: null, contactEmail: u.email || '', notes: '' } as StudentProfile));
        if (extra.length > 0) setStudents(prev => [...prev, ...extra]);
  }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student: StudentProfile) => {
    setSelectedStudent(student);
    setFormData({
      username: student.username,
      cgpa: student.cgpa?.toString() || '',
      numArrears: student.numArrears?.toString() || '',
      presentClass: student.presentClass || '',
      department: student.department || '',
      semester: student.semester?.toString() || '',
      contactEmail: student.contactEmail || '',
  notes: student.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setFormData({
      username: '',
      cgpa: '',
      numArrears: '',
      presentClass: '',
      department: '',
      semester: '',
      contactEmail: '',
  notes: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async (isEdit: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = isEdit 
  ? `${import.meta.env.VITE_API_BASE_URL}/api/learn/teacher/student/${encodeURIComponent(selectedStudent?.username || formData.username)}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/learn/teacher/student`;
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          cgpa: parseFloat(formData.cgpa) || null,
          numArrears: parseInt(formData.numArrears) || 0,
          presentClass: formData.presentClass,
          department: formData.department,
          semester: parseInt(formData.semester) || null,
          contactEmail: formData.contactEmail,
          notes: formData.notes
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Student ${isEdit ? 'updated' : 'added'} successfully!`,
        });
        setIsEditDialogOpen(false);
        setIsAddDialogOpen(false);
        fetchData(); // Refresh the data
      } else {
        throw new Error('Failed to save student data');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'add'} student. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // interested subjects removed

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">Teacher Portal</span>
            </div>
            <Badge variant="secondary">Welcome, {user?.firstName}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/teacher/portal">
              <Button variant="outline">Advanced Tools</Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Dashboard Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students with Arrears</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.numArrears > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Management</CardTitle>
              <Button onClick={handleAddStudent}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No students found. Add your first student to get started.</p>
                </div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold">{(student.username || '').slice(0,1).toUpperCase()}</div>
                                <h3 className="font-semibold">{student.username}</h3>
                        {student.numArrears > 0 && (
                          <Badge variant="destructive">{student.numArrears} Arrears</Badge>
                        )}
                        {student.cgpa && (
                          <Badge variant={student.cgpa >= 7.5 ? "default" : student.cgpa >= 6.0 ? "secondary" : "destructive"}>
                            CGPA: {student.cgpa}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {student.presentClass && <span>Class: {student.presentClass} • </span>}
                        {student.department && <span>Dept: {student.department} • </span>}
                        {student.semester && <span>Sem: {student.semester}</span>}
                      </div>
                      {/* interested subjects removed from UI */}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStudent(student)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        onClick={async () => {
                          if (!confirm(`Delete student ${student.username}? This action cannot be undone.`)) return;
                          try {
                            const token = localStorage.getItem('authToken');
                            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/learn/teacher/student/${encodeURIComponent(student.username)}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (res.status === 204) {
                              toast({ title: 'Deleted', description: `Student ${student.username} deleted.` });
                              fetchData();
                            } else if (res.status === 404) {
                              toast({ title: 'Not found', description: 'Student not found', variant: 'destructive' });
                              fetchData();
                            } else {
                              throw new Error('Delete failed');
                            }
                          } catch (e) {
                            console.error('Delete error', e);
                            toast({ title: 'Error', description: 'Failed to delete student', variant: 'destructive' });
                          }
                        }}
                      >
                        Delete
                      </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Student Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Student: {selectedStudent?.username}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cgpa">CGPA</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData(prev => ({ ...prev, cgpa: e.target.value }))}
                    placeholder="e.g., 7.8"
                  />
                </div>
                <div>
                  <Label htmlFor="arrears">Number of Arrears</Label>
                  <Input
                    id="arrears"
                    type="number"
                    min="0"
                    value={formData.numArrears}
                    onChange={(e) => setFormData(prev => ({ ...prev, numArrears: e.target.value }))}
                    placeholder="e.g., 1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Present Class</Label>
                  <Input
                    id="class"
                    value={formData.presentClass}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentClass: e.target.value }))}
                    placeholder="e.g., III Year B.Tech"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                    placeholder="e.g., 6"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="student@example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the student..."
                  rows={3}
                />
              </div>
              {/* Interested subjects removed from edit form */}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(true)}>
                Update Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Student Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="new-username">Username *</Label>
                <Input
                  id="new-username"
                  value={formData.username}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, username: val }));
                    setIsExistingUser(false);
                  }}
                  onBlur={async (e) => {
                    const username = (e.target as HTMLInputElement).value?.trim();
                    if (!username) return;
                    try {
                      const token = localStorage.getItem('authToken');
                      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/learn/student/${encodeURIComponent(username)}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) {
                        const match = await res.json();
                        setIsExistingUser(true);
                        setSelectedStudent(match);
                        setLookupError(null);
                        setFormData(prev => ({
                          ...prev,
                          cgpa: match.cgpa?.toString() || '',
                          numArrears: match.numArrears?.toString() || '',
                          presentClass: match.presentClass || '',
                          department: match.department || '',
                          semester: match.semester?.toString() || '',
                          contactEmail: match.contactEmail || '',
                          notes: match.notes || ''
                        }));
                      } else {
                        setIsExistingUser(false);
                        setSelectedStudent(null);
                        setLookupError('No platform user or student profile found for this username');
                      }
                    } catch (e) {
                      console.error('Lookup error', e);
                      setLookupError('Lookup failed — see console for details');
                    }
                  }}
                  placeholder="student_username"
                  required
                />

                {/* Suggestions: show small list of matching students from local cache */}
                {formData.username && (
                  <div className="mt-2">
                    {students.filter(s => s.username.toLowerCase().includes(formData.username.toLowerCase())).slice(0,5).map(s => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full text-left px-2 py-1 hover:bg-muted rounded flex items-center gap-2"
                        onClick={() => {
                          setSelectedStudent(s);
                          setIsExistingUser(true);
                          setLookupError(null);
                          setFormData(prev => ({
                            ...prev,
                            username: s.username,
                            cgpa: s.cgpa?.toString() || '',
                            numArrears: s.numArrears?.toString() || '',
                            presentClass: s.presentClass || '',
                            department: s.department || '',
                            semester: s.semester?.toString() || '',
                            contactEmail: s.contactEmail || '',
                            notes: s.notes || ''
                          }));
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">{(s.firstName || s.username || '').slice(0,1).toUpperCase()}</div>
                        <div>{s.username} <span className="text-sm text-muted-foreground">— {s.presentClass || s.department || ''}</span></div>
                      </button>
                    ))}
                    {lookupError && <div className="text-sm text-destructive mt-1">{lookupError}</div>}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-cgpa">CGPA</Label>
                  <Input
                    id="new-cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData(prev => ({ ...prev, cgpa: e.target.value }))}
                    placeholder="e.g., 7.8"
                  />
                </div>
                <div>
                  <Label htmlFor="new-arrears">Number of Arrears</Label>
                  <Input
                    id="new-arrears"
                    type="number"
                    min="0"
                    value={formData.numArrears}
                    onChange={(e) => setFormData(prev => ({ ...prev, numArrears: e.target.value }))}
                    placeholder="e.g., 1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-class">Present Class</Label>
                  <Input
                    id="new-class"
                    value={formData.presentClass}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentClass: e.target.value }))}
                    placeholder="e.g., III Year B.Tech"
                  />
                </div>
                <div>
                  <Label htmlFor="new-department">Department</Label>
                  <Input
                    id="new-department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-semester">Semester</Label>
                  <Input
                    id="new-semester"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                    placeholder="e.g., 6"
                  />
                </div>
                <div>
                  <Label htmlFor="new-email">Contact Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="student@example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="new-notes">Notes</Label>
                <Textarea
                  id="new-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the student..."
                  rows={3}
                />
              </div>
              {/* Interested subjects removed from add form */}
            </div>
              <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(isExistingUser)} disabled={!formData.username.trim()}>
                {isExistingUser ? 'Update Student' : 'Add Student'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default TeacherHome;
