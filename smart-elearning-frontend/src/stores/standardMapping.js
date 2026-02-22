export const standardToParam = (standard) => {
    const mapping = {
      // Math standards
      'Counting & Cardinality': 'counting-cardinality',
      'Operations & Algebraic Thinking': 'operations-algebraic-thinking',
      'Number & Operations in Base Ten': 'number-operations-base-ten',
      'Measurement & Data': 'measurement-data',
      'Geometry': 'geometry',
      'Math Practice': 'math-practice',
      
      // ELA standards
      'Language': 'language',
      'Reading: Foundational Skills': 'reading-foundational-skills',
      'Reading: Informational Text': 'reading-informational-text',
      'Reading: Literature': 'reading-literature',
      'Speaking & Listening': 'speaking-listening',
      'Writing': 'writing',
      
      // Science standards
      'Physical Sciences': 'physical-sciences',
      'Life Sciences': 'life-sciences',
      'Earth and Space Sciences': 'earth-space-sciences',
      'Engineering Design': 'engineering-design',
      'Waves: Light and Sound': 'waves-light-sound',
      'Structure, Function, and Information Processing': 'structure-function-info',
      'Space Systems: Patterns and Cycles': 'space-systems-patterns',
      'Structure and Properties of Matter': 'structure-properties-matter',
      'Interdependent Relationships in Ecosystems': 'ecosystems-relationships',
      'Earth\'s Systems: Processes that Shape the Earth': 'earth-systems-processes'
    }
    
    return mapping[standard] || standard.toLowerCase().replace(/:|\s/g, '-')
  }
  
  export const paramToStandard = (param) => {
    const mapping = {
      // Reverse of the above
      'counting-cardinality': 'Counting & Cardinality',
      'operations-algebraic-thinking': 'Operations & Algebraic Thinking',
      // ... add all reverse mappings
    }
    
    return mapping[param] || param.replace(/-/g, ' ')
  }