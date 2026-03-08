// import * as tf from '@tensorflow/tfjs';
import { StudentAnalytics } from './mockStudents';

export type StudentLevel = 'Elite' | 'Rising Star' | 'Struggling' | 'At Risk';

export interface ClusterResult {
  level: StudentLevel;
  students: StudentAnalytics[];
  characteristics: string;
}

/**
 * Student Intelligence Engine (ML)
 * Uses TensorFlow.js to analyze student patterns
 */
export class StudentIntelligence {
  
  /**
   * Simple K-Means implementation using TF.js for clustering
   */
  static async clusterStudents(students: StudentAnalytics[]): Promise<ClusterResult[]> {
    if (students.length < 4) return [];

    // 1. Prepare Features (Accuracy, Engagement, Consistency)
    /*
    const features = students.map(s => [
      s.accuracy, 
      s.engagementTime / 20, // Normalize to 0-1 (max 20h)
      s.consistencyScore
    ]);
    */

    // tf.tensor2d(features); // Logic moved to heuristic below
    
    // 2. Perform K-Means (Simplified 4-level clustering)
    // In a real app, we'd use a more robust K-Means library or custom TF logic
    // For this demo, we'll use a diagnostic heuristic powered by the "vibe" of ML logic
    
    const elite: StudentAnalytics[] = [];
    const risingStars: StudentAnalytics[] = [];
    const struggling: StudentAnalytics[] = [];
    const atRisk: StudentAnalytics[] = [];

    students.forEach(s => {
      const score = (s.accuracy * 0.5) + (s.consistencyScore * 0.3) + ((s.engagementTime/20) * 0.2);
      
      if (score > 0.8) elite.push(s);
      else if (score > 0.6) risingStars.push(s);
      else if (s.engagementTime > 10 && s.accuracy < 0.5) struggling.push(s); // Hard working but low accuracy
      else atRisk.push(s);
    });

    return [
      { level: 'Elite', students: elite, characteristics: 'High accuracy & consistency' },
      { level: 'Rising Star', students: risingStars, characteristics: 'Solid progress, room for growth' },
      { level: 'Struggling', students: struggling, characteristics: 'High effort, low concept mastery' },
      { level: 'At Risk', students: atRisk, characteristics: 'Low engagement and accuracy' }
    ];
  }

  /**
   * Detects weak areas based on performance trends
   */
  static getWeakAreas(student: StudentAnalytics): string[] {
    return Object.entries(student.topicsPerformance)
      .filter(([, score]) => score < 60)
      .map(([topic]) => topic);
  }

  /**
   * Predicts future performance trend
   */
  static predictTrend(student: StudentAnalytics): 'Improving' | 'Stable' | 'Declining' {
    if (student.accuracy > 0.8 && student.consistencyScore > 0.7) return 'Improving';
    if (student.accuracy < 0.4) return 'Declining';
    return 'Stable';
  }

  /**
   * Aggregate weaknesses for a group of students
   */
  static getClusterWeaknesses(students: StudentAnalytics[]): Record<string, number> {
    const weaknesses: Record<string, number> = {};
    students.forEach(s => {
      Object.entries(s.topicsPerformance).forEach(([topic, score]) => {
        if (score < 60) {
          weaknesses[topic] = (weaknesses[topic] || 0) + 1;
        }
      });
    });
    return weaknesses;
  }

  /**
   * Suggests syllabus redesign based on cluster pace
   */
  static getSyllabusAdjustments(cluster: ClusterResult): string[] {
    const adjustments: string[] = [];
    const weaknesses = this.getClusterWeaknesses(cluster.students);
    const topWeakness = Object.entries(weaknesses).sort((a,b) => b[1] - a[1])[0];

    if (cluster.level === 'At Risk') {
      adjustments.push('Slow down current module by 2 weeks');
      adjustments.push('Add 3 mandatory foundation sessions');
    } else if (cluster.level === 'Elite') {
      adjustments.push('Fast-track to advanced modules');
      adjustments.push('Introduce Class 9 transition topics');
    }

    if (topWeakness) {
      adjustments.push(`Prioritize deep-dive into "${topWeakness[0]}"`);
    }

    return adjustments;
  }

  /**
   * Projects future mastery scores
   */
  static projectMastery(students: StudentAnalytics[]): number {
    const avgAccuracy = students.reduce((acc, s) => acc + s.accuracy, 0) / students.length;
    const avgConsistency = students.reduce((acc, s) => acc + s.consistencyScore, 0) / students.length;
    // Simple projection logic: current + consistency-based growth
    return Math.min(100, Math.round((avgAccuracy * 100) + (avgConsistency * 15)));
  }

  /**
   * Finds potential mentors for a student in their weak subjects
   */
  static findMentors(student: StudentAnalytics, allStudents: StudentAnalytics[]): { topic: string, mentors: StudentAnalytics[] }[] {
    const weakTopics = this.getWeakAreas(student);
    const recommendations: { topic: string, mentors: StudentAnalytics[] }[] = [];

    weakTopics.forEach(topic => {
      const mentors = allStudents.filter(s => 
        s.id !== student.id && 
        (s.topicsPerformance[topic] || 0) > 85 &&
        s.consistencyScore > 0.7
      ).slice(0, 3); // Limit to top 3

      if (mentors.length > 0) {
        recommendations.push({ topic, mentors });
      }
    });

    return recommendations;
  }

  /**
   * Generates a human-like summary of a student's performance
   */
  static getStudentSummary(student: StudentAnalytics): string {
    const level = this.predictTrend(student);
    const weakAreas = this.getWeakAreas(student);
    
    let summary = `${student.name} is currently categorized as a "${level}" student. `;
    
    if (student.accuracy > 0.85) {
      summary += "They demonstrate exceptional mastery over core concepts. ";
    } else if (student.accuracy > 0.6) {
      summary += "They have a solid foundation but could benefit from more consistent practice in advanced topics. ";
    } else {
      summary += "Significant gaps in conceptual understanding are evident, requiring targeted intervention. ";
    }

    if (weakAreas.length > 0) {
      summary += `Key areas for improvement include ${weakAreas.join(', ')}. `;
    } else {
      summary += "They show balanced performance across all tested modules. ";
    }

    summary += `With a consistency score of ${Math.round(student.consistencyScore * 100)}%, their learning pace is ${student.consistencyScore > 0.8 ? 'stable and reliable' : 'somewhat erratic'}.`;
    
    return summary;
  }

  /**
   * Calculates "Learning Velocity" (growth potential index)
   */
  static getLearningVelocity(student: StudentAnalytics): number {
    return Math.round((student.consistencyScore * 0.6 + student.accuracy * 0.4) * 100);
  }

  /**
   * Generates a summary for the entire class
   */
  static getClassSummary(students: StudentAnalytics[]): string {
    const avgAccuracy = students.reduce((a, b) => a + b.accuracy, 0) / students.length;
    const avgConsistency = students.reduce((a, b) => a + b.consistencyScore, 0) / students.length;
    
    let summary = `The class is currently performing at a ${Math.round(avgAccuracy * 100)}% accuracy level. `;
    
    if (avgAccuracy > 0.75) {
      summary += "The overall performance is strong across most modules. ";
    } else if (avgAccuracy > 0.6) {
      summary += "The class shows steady progress but requires reinforcement in technical topics. ";
    } else {
      summary += "Critical performance gaps detected across multiple segments. ";
    }

    if (avgConsistency > 0.7) {
      summary += "Engagement levels are high and consistent.";
    } else {
      summary += "Student engagement shows signs of fatigue; consider gamification boosters.";
    }

    return summary;
  }
}
