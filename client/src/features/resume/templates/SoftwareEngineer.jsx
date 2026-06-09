import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { optimizePhrasing } from '../utils/resumeOptimizer';

const createStyles = (settings) => StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: settings.fontFamily || 'Roboto',
    fontSize: settings.fontSize || 10,
    color: '#1f2937',
    lineHeight: 1.5,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: settings.primaryColor || '#2563eb',
    paddingBottom: 15,
    marginBottom: 15,
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.1,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 500,
    color: settings.primaryColor || '#2563eb',
    fontFamily: 'Roboto', // Keep it monospace-like or rigid
    lineHeight: 1.2,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 9,
    color: '#4b5563',
  },
  linkText: {
    color: settings.primaryColor || '#2563eb',
    textDecoration: 'none',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 700,
    color: settings.primaryColor || '#2563eb',
    textTransform: 'uppercase',
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 2,
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
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 9,
    color: '#374151',
    fontWeight: 500,
  },
  experienceItem: {
    marginBottom: 12,
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
    fontSize: 9,
    fontWeight: 500,
    color: '#6b7280',
  },
  companyText: {
    fontWeight: 500,
    fontSize: 10,
    color: settings.secondaryColor || '#4b5563',
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
    color: settings.primaryColor || '#2563eb',
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
  techStackContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  techBadge: {
    fontSize: 8,
    color: settings.primaryColor || '#2563eb',
    backgroundColor: settings.primaryColor ? `${settings.primaryColor}15` : '#eff6ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  educationItem: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eduDegree: {
    fontWeight: 700,
    fontSize: 10,
    color: '#111827',
  },
  eduSchool: {
    fontSize: 9,
    color: '#4b5563',
    marginTop: 2,
  }
});

export const SoftwareEngineerTheme = ({ user, profile, settings, optimize }) => {
  const styles = createStyles(settings);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{user?.name || 'Your Name'}</Text>
          <Text style={styles.title}>{profile?.title || 'Software Engineer'}</Text>
          <View style={styles.contactRow}>
            {user?.email && <Text>{user.email}</Text>}
            {profile?.githubUrl && (
              <Link src={profile.githubUrl} style={styles.linkText}>
                {profile.githubUrl.replace(/^https?:\/\//, '')}
              </Link>
            )}
            {profile?.linkedinUrl && (
              <Link src={profile.linkedinUrl} style={styles.linkText}>
                {profile.linkedinUrl.replace(/^https?:\/\//, '')}
              </Link>
            )}
          </View>
        </View>

        {/* SKILLS - At the top for Software Engineers */}
        {profile?.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Technical Skills</Text>
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill, index) => (
                <Text key={index} style={styles.skillBadge}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {/* SUMMARY */}
        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Summary</Text>
            <Text style={styles.summaryText}>
              {optimize ? optimizePhrasing(profile.bio) : profile.bio}
            </Text>
          </View>
        )}

        {/* EXPERIENCE */}
        {profile?.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Experience</Text>
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
                      <Text style={styles.bulletIcon}>›</Text>
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
            <Text style={styles.sectionHeader}>Notable Projects</Text>
            {profile.projects.map((proj, idx) => (
              <View key={idx} style={styles.projectItem}>
                <View style={styles.projectTitleRow}>
                  <Text style={styles.projectTitle}>{proj.title}</Text>
                  {(proj.liveLink || proj.githubLink) && (
                    <Link src={proj.liveLink || proj.githubLink} style={styles.linkText}>
                      {(proj.liveLink || proj.githubLink).replace(/^https?:\/\//, '')}
                    </Link>
                  )}
                </View>
                
                {proj.technologies && proj.technologies.length > 0 && (
                  <View style={styles.techStackContainer}>
                    {proj.technologies.map((tech, tIdx) => (
                      <Text key={tIdx} style={styles.techBadge}>{tech}</Text>
                    ))}
                  </View>
                )}
                
                {proj.description && proj.description.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
                  const bulletLine = line.replace(/^[-*•]\s*/, '');
                  const processedText = optimize ? optimizePhrasing(bulletLine) : bulletLine;
                  return (
                    <View key={i} style={styles.bulletPoint}>
                      <Text style={styles.bulletIcon}>›</Text>
                      <Text style={styles.bulletText}>{processedText}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* EDUCATION */}
        {profile?.education && profile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            {profile.education.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <View style={{ flex: 1 }}>
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

export default SoftwareEngineerTheme;
