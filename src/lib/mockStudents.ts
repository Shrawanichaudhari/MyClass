export interface StudentAnalytics {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  accuracy: number; // 0-1
  completionRate: number; // 0-1
  engagementTime: number; // hours
  consistencyScore: number; // 0-1
  topicsPerformance: Record<string, number>; // topic -> score (0-100)
}

export const MOCK_STUDENTS: StudentAnalytics[] = [
  { id: 's1', name: 'Aryan Singh', avatar: '👦', grade: 'Class 8', accuracy: 0.92, completionRate: 0.95, engagementTime: 12.5, consistencyScore: 0.9, topicsPerformance: { 'Algebra': 95, 'Geometry': 88, 'Fractions': 92, 'Trigonometry': 85 } },
  { id: 's2', name: 'Priya Sharma', avatar: '👧', grade: 'Class 8', accuracy: 0.45, completionRate: 0.8, engagementTime: 15.0, consistencyScore: 0.7, topicsPerformance: { 'Algebra': 40, 'Geometry': 55, 'Fractions': 42, 'Trigonometry': 35 } },
  { id: 's3', name: 'Rahul Kumar', avatar: '👦', grade: 'Class 8', accuracy: 0.75, completionRate: 0.6, engagementTime: 5.2, consistencyScore: 0.4, topicsPerformance: { 'Algebra': 78, 'Geometry': 70, 'Fractions': 75, 'Trigonometry': 65 } },
  { id: 's4', name: 'Ananya Iyer', avatar: '👧', grade: 'Class 8', accuracy: 0.88, completionRate: 0.9, engagementTime: 10.0, consistencyScore: 0.85, topicsPerformance: { 'Algebra': 90, 'Geometry': 85, 'Fractions': 88, 'Trigonometry': 82 } },
  { id: 's5', name: 'Vikram Das', avatar: '👦', grade: 'Class 8', accuracy: 0.35, completionRate: 0.3, engagementTime: 2.5, consistencyScore: 0.2, topicsPerformance: { 'Algebra': 30, 'Geometry': 40, 'Fractions': 35, 'Trigonometry': 25 } },
  { id: 's6', name: 'Sanya Malhotra', avatar: '👧', grade: 'Class 8', accuracy: 0.98, completionRate: 1.0, engagementTime: 20.0, consistencyScore: 0.95, topicsPerformance: { 'Algebra': 100, 'Geometry': 95, 'Fractions': 98, 'Trigonometry': 98 } },
  { id: 's7', name: 'Kabir Khan', avatar: '👦', grade: 'Class 8', accuracy: 0.65, completionRate: 0.85, engagementTime: 18.0, consistencyScore: 0.75, topicsPerformance: { 'Algebra': 60, 'Geometry': 68, 'Fractions': 65, 'Trigonometry': 58 } },
  { id: 's8', name: 'Meera Reddy', avatar: '👧', grade: 'Class 8', accuracy: 0.82, completionRate: 0.88, engagementTime: 14.2, consistencyScore: 0.8, topicsPerformance: { 'Algebra': 85, 'Geometry': 80, 'Fractions': 82, 'Trigonometry': 78 } },
  { id: 's9', name: 'Dev Pratap', avatar: '👦', grade: 'Class 8', accuracy: 0.52, completionRate: 0.65, engagementTime: 11.0, consistencyScore: 0.55, topicsPerformance: { 'Algebra': 48, 'Geometry': 58, 'Fractions': 52, 'Trigonometry': 45 } },
  { id: 's10', name: 'Ishita Bose', avatar: '👧', grade: 'Class 8', accuracy: 0.91, completionRate: 0.92, engagementTime: 13.5, consistencyScore: 0.88, topicsPerformance: { 'Algebra': 92, 'Geometry': 90, 'Fractions': 94, 'Trigonometry': 88 } },
  { id: 's11', name: 'Rohan Joshi', avatar: '👦', grade: 'Class 8', accuracy: 0.38, completionRate: 0.45, engagementTime: 4.2, consistencyScore: 0.3, topicsPerformance: { 'Algebra': 35, 'Geometry': 42, 'Fractions': 38, 'Trigonometry': 32 } },
  { id: 's12', name: 'Kritika Sen', avatar: '👧', grade: 'Class 8', accuracy: 0.78, completionRate: 0.82, engagementTime: 12.0, consistencyScore: 0.75, topicsPerformance: { 'Algebra': 82, 'Geometry': 75, 'Fractions': 78, 'Trigonometry': 72 } },
  { id: 's13', name: 'Zaid Ahmed', avatar: '👦', grade: 'Class 8', accuracy: 0.42, completionRate: 0.75, engagementTime: 16.5, consistencyScore: 0.65, topicsPerformance: { 'Algebra': 38, 'Geometry': 45, 'Fractions': 40, 'Trigonometry': 35 } },
  { id: 's14', name: 'Sneha Patil', avatar: '👧', grade: 'Class 8', accuracy: 0.95, completionRate: 0.98, engagementTime: 19.0, consistencyScore: 0.92, topicsPerformance: { 'Algebra': 98, 'Geometry': 92, 'Fractions': 96, 'Trigonometry': 94 } },
  { id: 's15', name: 'Aarav Gupta', avatar: '👦', grade: 'Class 8', accuracy: 0.68, completionRate: 0.72, engagementTime: 10.5, consistencyScore: 0.68, topicsPerformance: { 'Algebra': 65, 'Geometry': 70, 'Fractions': 68, 'Trigonometry': 62 } },
  { id: 's16', name: 'Diya Nair', avatar: '👧', grade: 'Class 8', accuracy: 0.87, completionRate: 0.85, engagementTime: 11.5, consistencyScore: 0.85, topicsPerformance: { 'Algebra': 88, 'Geometry': 84, 'Fractions': 87, 'Trigonometry': 85 } },
  { id: 's17', name: 'Sahil Varma', avatar: '👦', grade: 'Class 8', accuracy: 0.31, completionRate: 0.4, engagementTime: 3.5, consistencyScore: 0.25, topicsPerformance: { 'Algebra': 28, 'Geometry': 35, 'Fractions': 30, 'Trigonometry': 25 } },
  { id: 's18', name: 'Tanvi Shah', avatar: '👧', grade: 'Class 8', accuracy: 0.74, completionRate: 0.78, engagementTime: 10.8, consistencyScore: 0.72, topicsPerformance: { 'Algebra': 75, 'Geometry': 72, 'Fractions': 74, 'Trigonometry': 70 } },
  { id: 's19', name: 'Yash Malhotra', avatar: '👦', grade: 'Class 8', accuracy: 0.58, completionRate: 0.8, engagementTime: 15.2, consistencyScore: 0.6, topicsPerformance: { 'Algebra': 55, 'Geometry': 62, 'Fractions': 58, 'Trigonometry': 52 } },
  { id: 's20', name: 'Riya Kapoor', avatar: '👧', grade: 'Class 8', accuracy: 0.94, completionRate: 0.96, engagementTime: 17.5, consistencyScore: 0.9, topicsPerformance: { 'Algebra': 96, 'Geometry': 92, 'Fractions': 94, 'Trigonometry': 90 } },
  { id: 's21', name: 'Manish Pandey', avatar: '👦', grade: 'Class 8', accuracy: 0.48, completionRate: 0.55, engagementTime: 8.5, consistencyScore: 0.5, topicsPerformance: { 'Algebra': 45, 'Geometry': 50, 'Fractions': 48, 'Trigonometry': 42 } },
  { id: 's22', name: 'Isha Gujral', avatar: '👧', grade: 'Class 8', accuracy: 0.89, completionRate: 0.9, engagementTime: 11.2, consistencyScore: 0.87, topicsPerformance: { 'Algebra': 90, 'Geometry': 88, 'Fractions': 89, 'Trigonometry': 86 } },
  { id: 's23', name: 'Arjun Mehra', avatar: '👦', grade: 'Class 8', accuracy: 0.62, completionRate: 0.7, engagementTime: 9.8, consistencyScore: 0.65, topicsPerformance: { 'Algebra': 65, 'Geometry': 60, 'Fractions': 62, 'Trigonometry': 58 } },
  { id: 's24', name: 'Kiara Advani', avatar: '👧', grade: 'Class 8', accuracy: 0.96, completionRate: 0.98, engagementTime: 18.5, consistencyScore: 0.94, topicsPerformance: { 'Algebra': 98, 'Geometry': 94, 'Fractions': 96, 'Trigonometry': 95 } },
  { id: 's25', name: 'Neil Nitin', avatar: '👦', grade: 'Class 8', accuracy: 0.32, completionRate: 0.35, engagementTime: 3.2, consistencyScore: 0.28, topicsPerformance: { 'Algebra': 30, 'Geometry': 35, 'Fractions': 32, 'Trigonometry': 28 } },
  // Class 10
  { id: 's26', name: 'Tara Sutaria', avatar: '👧', grade: 'Class 10', accuracy: 0.77, completionRate: 0.8, engagementTime: 10.5, consistencyScore: 0.75, topicsPerformance: { 'Algebra': 80, 'Geometry': 75, 'Fractions': 78, 'Trigonometry': 74 } },
  { id: 's27', name: 'Varun Dhawan', avatar: '👦', grade: 'Class 10', accuracy: 0.55, completionRate: 0.6, engagementTime: 7.2, consistencyScore: 0.58, topicsPerformance: { 'Algebra': 52, 'Geometry': 58, 'Fractions': 55, 'Trigonometry': 50 } },
  { id: 's28', name: 'Alia Bhatt', avatar: '👧', grade: 'Class 10', accuracy: 0.91, completionRate: 0.93, engagementTime: 14.8, consistencyScore: 0.89, topicsPerformance: { 'Algebra': 92, 'Geometry': 90, 'Fractions': 91, 'Trigonometry': 88 } },
  { id: 's29', name: 'Ranbir Singh', avatar: '👦', grade: 'Class 10', accuracy: 0.41, completionRate: 0.5, engagementTime: 6.5, consistencyScore: 0.45, topicsPerformance: { 'Algebra': 38, 'Geometry': 45, 'Fractions': 42, 'Trigonometry': 35 } },
  { id: 's30', name: 'Deepika P.', avatar: '👧', grade: 'Class 10', accuracy: 0.99, completionRate: 1.0, engagementTime: 22.0, consistencyScore: 0.98, topicsPerformance: { 'Algebra': 100, 'Geometry': 100, 'Fractions': 99, 'Trigonometry': 98 } },
  { id: 's31', name: 'Kartik A.', avatar: '👦', grade: 'Class 10', accuracy: 0.68, completionRate: 0.75, engagementTime: 10.2, consistencyScore: 0.7, topicsPerformance: { 'Algebra': 70, 'Geometry': 65, 'Fractions': 68, 'Trigonometry': 62 } },
  { id: 's32', name: 'Kriti Sanon', avatar: '👧', grade: 'Class 10', accuracy: 0.85, completionRate: 0.88, engagementTime: 12.2, consistencyScore: 0.82, topicsPerformance: { 'Algebra': 88, 'Geometry': 82, 'Fractions': 85, 'Trigonometry': 80 } },
  { id: 's33', name: 'Vicky Kaushal', avatar: '👦', grade: 'Class 10', accuracy: 0.39, completionRate: 0.42, engagementTime: 4.5, consistencyScore: 0.35, topicsPerformance: { 'Algebra': 35, 'Geometry': 40, 'Fractions': 38, 'Trigonometry': 32 } },
  { id: 's34', name: 'Katrina K.', avatar: '👧', grade: 'Class 10', accuracy: 0.93, completionRate: 0.95, engagementTime: 16.5, consistencyScore: 0.91, topicsPerformance: { 'Algebra': 95, 'Geometry': 90, 'Fractions': 94, 'Trigonometry': 92 } },
  { id: 's35', name: 'Ayushmann K.', avatar: '👦', grade: 'Class 10', accuracy: 0.72, completionRate: 0.78, engagementTime: 9.5, consistencyScore: 0.74, topicsPerformance: { 'Algebra': 75, 'Geometry': 70, 'Fractions': 72, 'Trigonometry': 68 } },
  { id: 's36', name: 'Bhumi P.', avatar: '👧', grade: 'Class 10', accuracy: 0.81, completionRate: 0.85, engagementTime: 11.8, consistencyScore: 0.8, topicsPerformance: { 'Algebra': 85, 'Geometry': 78, 'Fractions': 82, 'Trigonometry': 76 } },
  { id: 's37', name: 'Rajkummar Rao', avatar: '👦', grade: 'Class 10', accuracy: 0.44, completionRate: 0.52, engagementTime: 7.8, consistencyScore: 0.48, topicsPerformance: { 'Algebra': 40, 'Geometry': 48, 'Fractions': 44, 'Trigonometry': 38 } },
  { id: 's38', name: 'Shraddha K.', avatar: '👧', grade: 'Class 10', accuracy: 0.90, completionRate: 0.92, engagementTime: 13.2, consistencyScore: 0.88, topicsPerformance: { 'Algebra': 92, 'Geometry': 88, 'Fractions': 90, 'Trigonometry': 85 } },
  { id: 's39', name: 'Sidharth M.', avatar: '👦', grade: 'Class 10', accuracy: 0.59, completionRate: 0.65, engagementTime: 8.2, consistencyScore: 0.62, topicsPerformance: { 'Algebra': 55, 'Geometry': 62, 'Fractions': 60, 'Trigonometry': 54 } },
  { id: 's40', name: 'Janhvi Kapoor', avatar: '👧', grade: 'Class 10', accuracy: 0.86, completionRate: 0.89, engagementTime: 12.8, consistencyScore: 0.84, topicsPerformance: { 'Algebra': 88, 'Geometry': 84, 'Fractions': 86, 'Trigonometry': 82 } },
  { id: 's41', name: 'Ishaan Khatter', avatar: '👦', grade: 'Class 10', accuracy: 0.36, completionRate: 0.4, engagementTime: 3.8, consistencyScore: 0.32, topicsPerformance: { 'Algebra': 32, 'Geometry': 38, 'Fractions': 35, 'Trigonometry': 30 } },
  { id: 's42', name: 'Sara Ali Khan', avatar: '👧', grade: 'Class 10', accuracy: 0.84, completionRate: 0.87, engagementTime: 11.2, consistencyScore: 0.82, topicsPerformance: { 'Algebra': 86, 'Geometry': 82, 'Fractions': 84, 'Trigonometry': 80 } },
  { id: 's43', name: 'Tiger Shroff', avatar: '👦', grade: 'Class 10', accuracy: 0.51, completionRate: 0.58, engagementTime: 10.5, consistencyScore: 0.55, topicsPerformance: { 'Algebra': 48, 'Geometry': 55, 'Fractions': 52, 'Trigonometry': 45 } },
  { id: 's44', name: 'Disha Patani', avatar: '👧', grade: 'Class 10', accuracy: 0.92, completionRate: 0.94, engagementTime: 15.8, consistencyScore: 0.9, topicsPerformance: { 'Algebra': 95, 'Geometry': 90, 'Fractions': 93, 'Trigonometry': 91 } },
  { id: 's45', name: 'Varun Sharma', avatar: '👦', grade: 'Class 10', accuracy: 0.64, completionRate: 0.7, engagementTime: 9.0, consistencyScore: 0.68, topicsPerformance: { 'Algebra': 68, 'Geometry': 62, 'Fractions': 65, 'Trigonometry': 60 } },
  { id: 's46', name: 'Richa Chadha', avatar: '👧', grade: 'Class 10', accuracy: 0.79, completionRate: 0.83, engagementTime: 11.5, consistencyScore: 0.77, topicsPerformance: { 'Algebra': 82, 'Geometry': 78, 'Fractions': 80, 'Trigonometry': 75 } },
  { id: 's47', name: 'Pankaj Tripathi', avatar: '👦', grade: 'Class 10', accuracy: 0.97, completionRate: 0.99, engagementTime: 21.0, consistencyScore: 0.96, topicsPerformance: { 'Algebra': 100, 'Geometry': 98, 'Fractions': 99, 'Trigonometry': 97 } },
  { id: 's48', name: 'Vidya Balan', avatar: '👧', grade: 'Class 10', accuracy: 0.83, completionRate: 0.86, engagementTime: 12.5, consistencyScore: 0.81, topicsPerformance: { 'Algebra': 85, 'Geometry': 80, 'Fractions': 83, 'Trigonometry': 78 } },
  { id: 's49', name: 'Nawazuddin S.', avatar: '👦', grade: 'Class 10', accuracy: 0.49, completionRate: 0.56, engagementTime: 8.8, consistencyScore: 0.52, topicsPerformance: { 'Algebra': 45, 'Geometry': 52, 'Fractions': 48, 'Trigonometry': 42 } },
  { id: 's50', name: 'Taapsee Pannu', avatar: '👧', grade: 'Class 10', accuracy: 0.88, completionRate: 0.91, engagementTime: 14.0, consistencyScore: 0.87, topicsPerformance: { 'Algebra': 90, 'Geometry': 86, 'Fractions': 88, 'Trigonometry': 84 } }
];
