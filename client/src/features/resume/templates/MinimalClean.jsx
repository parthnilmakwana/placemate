import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { optimizePhrasing } from '../utils/resumeOptimizer';

const createStyles = (settings) => StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: settings.fontFamily || 'Inter',
    fontSize: settings.fontSize || 10,
    color: '#111827', // Darker text for minimal clean
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
  },
  name: {
    fontSize: 28,
    fontWeight: 700,
    color: settings.primaryColor || '#111827',
    lineHeight: 1.1,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: 400,
    color: settings.secondaryColor || '#6b7280',
    lineHeight: 1.2,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 9,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 700,
    color: settings.primaryColor || '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  summaryText: {
    color: '#4b5563',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillText: {
    fontSize: 10,
    color: '#374151',
  },
  experienceItem: {
    marginBottom: 16,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  positionTitle: {
    fontWeight: 700,
    fontSize: 11,
    color: '#111827',
  },
  companyText: {
    fontWeight: 400,
    fontSize: 11,
    color: settings.secondaryColor || '#4b5563',
  },
  dateText: {
    fontSize: 9,
    color: '#9ca3af',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 2,
  },
  bulletIcon: {
    width: 12,
    fontSize: 10,
    color: settings.primaryColor || '#111827',
  },
  bulletText: {
    flex: 1,
    color: '#4b5563',
  },
  projectItem: {
    marginBottom: 12,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  projectTitle: {
    fontWeight: 700,
    fontSize: 11,
    color: '#111827',
  },
  projectLink: {
    fontSize: 9,
    color: settings.secondaryColor || '#6b7280',
    textDecoration: 'none',
  },
  educationItem: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  eduDegree: {
    fontWeight: 700,
    fontSize: 11,
    color: '#111827',
  },
  eduSchool: {
    fontSize: 10,
    color: '#4b5563',
  }
});

export const MinimalCleanTheme = ({ user, profile, settings, optimize }) => {
  const styles = createStyles(settings);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{user?.name || 'Your Name'}</Text>
          <Text style={styles.title}>{profile?.title || 'Professional Title'}</Text>
          <View style={styles.contactRow}>
            {user?.email && <Text>{user.email}</Text>}
            {profile?.githubUrl && <Text>{profile.githubUrl.replace(/^https?:\/\//, '')}</Text>}
            {profile?.linkedinUrl && <Text>{profile.linkedinUrl.replace(/^https?:\/\//, '')}</Text>}
          </View>
        </View>

        {/* SUMMARY */}
        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Summary</Text>
            <Text style={styles.summaryText}>
              {optimize ? optimizePhrasing(profile.bio) : profile.bio}
            </Text>
          </View>
        )}

        {/* SKILLS */}
        {profile?.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Expertise</Text>
            <View style={styles.skillsContainer}>
              <Text style={styles.skillText}>{profile.skills.join('   /   ')}</Text>
            </View>
          </View>
        )}

        {/* EXPERIENCE */}
        {profile?.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Experience</Text>
            {profile.experience.map((exp, idx) => (
              <View key={idx} style={styles.experienceItem}>
                <View style={styles.expHeader}>
                  <View>
                    <Text style={styles.positionTitle}>{exp.position}</Text>
                    <Text style={styles.companyText}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</Text>
                  </View>
                  <Text style={styles.dateText}>{exp.startDate} - {exp.current ? 'Present' : (exp.endDate || 'Present')}</Text>
                </View>
                
                {exp.description && exp.description.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
                  const bulletLine = line.replace(/^[-*•]\s*/, '');
                  const processedText = optimize ? optimizePhrasing(bulletLine) : bulletLine;
                  return (
                    <View key={i} style={styles.bulletPoint}>
                      <Text style={styles.bulletIcon}>-</Text>
                      <Text style={styles.bulletText}>{processedText}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* PROJECTS */}
        {profile?.projects && profile.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Projects</Text>
            {profile.projects.map((proj, idx) => {
              const techStack = proj.technologies?.length ? `— ${proj.technologies.join(', ')}` : '';
              return (
                <View key={idx} style={styles.projectItem}>
                  <View style={styles.projectTitleRow}>
                    <Text style={styles.projectTitle}>{proj.title}</Text>
                    <Text style={{ fontSize: 9, color: '#9ca3af' }}>{techStack}</Text>
                    {(proj.liveLink || proj.githubLink) && (
                      <Link src={proj.liveLink || proj.githubLink} style={styles.projectLink}>
                        {(proj.liveLink || proj.githubLink).replace(/^https?:\/\//, '')}
                      </Link>
                    )}
                  </View>
                  
                  {proj.description && proj.description.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
                    const bulletLine = line.replace(/^[-*•]\s*/, '');
                    const processedText = optimize ? optimizePhrasing(bulletLine) : bulletLine;
                    return (
                      <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.bulletIcon}>-</Text>
                        <Text style={styles.bulletText}>{processedText}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        {/* EDUCATION */}
        {profile?.education && profile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            {profile.education.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <View>
                  <Text style={styles.eduDegree}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</Text>
                  <Text style={styles.eduSchool}>{edu.institution}</Text>
                </View>
                <Text style={styles.dateText}>{edu.startYear} - {edu.endYear || 'Present'}</Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
};

export default MinimalCleanTheme;
