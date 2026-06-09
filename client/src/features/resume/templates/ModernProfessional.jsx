import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { optimizePhrasing } from '../utils/resumeOptimizer';

// Create styles
const createStyles = (settings) => StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: settings.fontFamily || 'Inter',
    fontSize: settings.fontSize || 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: settings.primaryColor || '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 1.1,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 500,
    color: settings.secondaryColor || '#4f46e5',
    textTransform: 'uppercase',
    lineHeight: 1.2,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: 9,
    color: '#64748b',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 700,
    color: settings.primaryColor || '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    textAlign: 'justify',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    color: '#475569',
  },
  experienceItem: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  positionTitle: {
    fontWeight: 700,
    fontSize: 11,
    color: '#1e293b',
  },
  dateText: {
    fontSize: 9,
    color: '#64748b',
  },
  companyText: {
    fontWeight: 500,
    fontSize: 10,
    color: settings.secondaryColor || '#4f46e5',
    marginBottom: 4,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletIcon: {
    width: 10,
    fontSize: 10,
    color: '#64748b',
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
  },
  projectItem: {
    marginBottom: 10,
  },
  projectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  projectTitle: {
    fontWeight: 700,
    fontSize: 11,
    color: '#1e293b',
  },
  projectLink: {
    fontSize: 9,
    color: settings.secondaryColor || '#4f46e5',
    textDecoration: 'none',
  },
  educationItem: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eduLeft: {
    flex: 1,
  },
  eduDegree: {
    fontWeight: 700,
    fontSize: 10,
    color: '#1e293b',
  },
  eduSchool: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  }
});

export const ModernProfessionalTheme = ({ user, profile, settings, optimize }) => {
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
            {profile?.githubUrl && <Text>•   {profile.githubUrl.replace(/^https?:\/\//, '')}</Text>}
            {profile?.linkedinUrl && <Text>•   {profile.linkedinUrl.replace(/^https?:\/\//, '')}</Text>}
          </View>
        </View>

        {/* SUMMARY */}
        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Summary</Text>
            <Text style={styles.summaryText}>
              {optimize ? optimizePhrasing(profile.bio) : profile.bio}
            </Text>
          </View>
        )}

        {/* SKILLS */}
        {profile?.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Core Expertise</Text>
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill, index) => (
                <Text key={index} style={styles.skillBadge}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {/* EXPERIENCE */}
        {profile?.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Experience</Text>
            {profile.experience.map((exp, idx) => (
              <View key={idx} style={styles.experienceItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.positionTitle}>{exp.position}</Text>
                  <Text style={styles.dateText}>{exp.startDate} - {exp.current ? 'Present' : (exp.endDate || 'Present')}</Text>
                </View>
                <Text style={styles.companyText}>
                  {exp.company}{exp.location ? ` | ${exp.location}` : ''}
                </Text>
                
                {exp.description && exp.description.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
                  const bulletLine = line.replace(/^[-*•]\s*/, '');
                  const processedText = optimize ? optimizePhrasing(bulletLine) : bulletLine;
                  return (
                    <View key={i} style={styles.bulletPoint}>
                      <Text style={styles.bulletIcon}>•</Text>
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
            <Text style={styles.sectionHeader}>Selected Projects</Text>
            {profile.projects.map((proj, idx) => {
              const techStack = proj.technologies?.length ? ` [${proj.technologies.join(', ')}]` : '';
              return (
                <View key={idx} style={styles.projectItem}>
                  <View style={styles.projectTitleRow}>
                    <Text style={styles.projectTitle}>{proj.title}{techStack}</Text>
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
                        <Text style={styles.bulletIcon}>•</Text>
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
            <Text style={styles.sectionHeader}>Education Background</Text>
            {profile.education.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <View style={styles.eduLeft}>
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

export default ModernProfessionalTheme;
