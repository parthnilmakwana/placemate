import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { optimizePhrasing } from '../utils/resumeOptimizer';

const createStyles = (settings) => StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: settings.fontFamily || 'Merriweather',
    fontSize: settings.fontSize || 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  headerBackground: {
    backgroundColor: settings.primaryColor || '#1e3a8a',
    padding: 40,
    paddingBottom: 30,
    color: '#ffffff',
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 2,
    lineHeight: 1.1,
    marginBottom: 6,
    textAlign: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: 400,
    textAlign: 'center',
    lineHeight: 1.2,
    marginBottom: 16,
    letterSpacing: 1,
    color: '#e0e7ff',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    fontSize: 9,
  },
  contactText: {
    color: '#ffffff',
  },
  mainContent: {
    padding: 40,
    paddingTop: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderContainer: {
    borderBottomWidth: 2,
    borderBottomColor: settings.secondaryColor || '#1e3a8a',
    marginBottom: 12,
    paddingBottom: 4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 700,
    color: settings.primaryColor || '#1e3a8a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryText: {
    textAlign: 'justify',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 4,
    columnGap: 12,
  },
  skillText: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1f2937',
  },
  experienceItem: {
    marginBottom: 14,
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
    color: '#111827',
  },
  dateText: {
    fontSize: 10,
    fontWeight: 700,
    color: settings.secondaryColor || '#1e3a8a',
  },
  companyText: {
    fontWeight: 400,
    fontSize: 10,
    color: '#4b5563',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 6,
  },
  bulletIcon: {
    width: 12,
    fontSize: 10,
    color: '#4b5563',
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
  },
  projectItem: {
    marginBottom: 12,
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
    color: '#111827',
  },
  projectLink: {
    fontSize: 9,
    color: settings.secondaryColor || '#1e3a8a',
    textDecoration: 'underline',
  },
  educationItem: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eduDegree: {
    fontWeight: 700,
    fontSize: 11,
    color: '#111827',
  },
  eduSchool: {
    fontSize: 10,
    color: '#4b5563',
    fontStyle: 'italic',
    marginTop: 2,
  }
});

export const ExecutiveCorporateTheme = ({ user, profile, settings, optimize }) => {
  const styles = createStyles(settings);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER BLOCK */}
        <View style={styles.headerBackground}>
          <Text style={styles.name}>{user?.name || 'Your Name'}</Text>
          <Text style={styles.title}>{profile?.title || 'Professional Title'}</Text>
          <View style={styles.contactRow}>
            {user?.email && <Text style={styles.contactText}>{user.email}</Text>}
            {profile?.githubUrl && <Text style={styles.contactText}>|   {profile.githubUrl.replace(/^https?:\/\//, '')}</Text>}
            {profile?.linkedinUrl && <Text style={styles.contactText}>|   {profile.linkedinUrl.replace(/^https?:\/\//, '')}</Text>}
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* SUMMARY */}
          {profile?.bio && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Executive Summary</Text>
              </View>
              <Text style={styles.summaryText}>
                {optimize ? optimizePhrasing(profile.bio) : profile.bio}
              </Text>
            </View>
          )}

          {/* SKILLS */}
          {profile?.skills && profile.skills.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Areas of Expertise</Text>
              </View>
              <View style={styles.skillsContainer}>
                {profile.skills.map((skill, index) => (
                  <Text key={index} style={styles.skillText}>• {skill}</Text>
                ))}
              </View>
            </View>
          )}

          {/* EXPERIENCE */}
          {profile?.experience && profile.experience.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Professional Experience</Text>
              </View>
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
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Key Initiatives</Text>
              </View>
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
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Education & Credentials</Text>
              </View>
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

        </View>

      </Page>
    </Document>
  );
};

export default ExecutiveCorporateTheme;
