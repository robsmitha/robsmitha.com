<template>
    <div class="file-tree-item">
      <div 
        :class="['item-row d-flex align-center', { 'clickable': item.type === 'file' }]" 
        :style="{ paddingLeft: `${indent * 16}px` }"
        @click="handleClick"
      >
        <!-- Directory icon with expand/collapse -->
        <template v-if="item.type === 'directory'">
          <v-icon 
            size="small" 
            class="mr-2 expand-icon"
            @click.stop="toggleExpanded"
          >
            {{ expanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
          </v-icon>
          <v-icon size="small" color="amber" class="mr-2">mdi-folder{{ expanded ? '-open' : '' }}</v-icon>
        </template>
        
        <!-- File icon -->
        <template v-else>
          <div class="mr-2 expand-icon-placeholder"></div>
          <v-icon size="small" class="mr-2" :color="getFileIconColor(item.name)">
            {{ getFileIcon(item.name) }}
          </v-icon>
        </template>
        
        <span>{{ item.name }}</span>
      </div>
      
      <!-- Render children recursively if expanded -->
      <div v-if="expanded && item.children && item.children.length > 0">
        <FileItem
          v-for="(child, index) in item.children"
          :key="index"
          :item="child"
          :indent="indent + 1"
          @file-click="handleFileClick"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { SearchItem, TreeNode } from '@/components/Code/CodeSearch.types'
  
  const props = defineProps<{
    item: TreeNode;
    indent: number;
  }>();
  
  const emit = defineEmits<{
    (event: 'file-click', file: SearchItem): void;
  }>();
  
  const expanded = ref<boolean>(false);
  
  const toggleExpanded = (): void => {
    expanded.value = !expanded.value;
  };
  
  const handleClick = (): void => {
    if (props.item.type === 'directory') {
      toggleExpanded();
    } else if (props.item.fileData) {
      emit('file-click', props.item.fileData);
    }
  };
  
  const handleFileClick = (file: SearchItem): void => {
    emit('file-click', file);
  };
  
  interface IconMap {
    [extension: string]: string;
  }
  
  interface ColorMap {
    [extension: string]: string;
  }
  
  // Determine icon based on file extension
  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const iconMap: IconMap = {
      'cs': 'mdi-language-csharp',
      'js': 'mdi-language-javascript',
      'ts': 'mdi-language-typescript',
      'vue': 'mdi-vuejs',
      'html': 'mdi-language-html5',
      'css': 'mdi-language-css3',
      'json': 'mdi-code-json',
      'md': 'mdi-language-markdown',
      'py': 'mdi-language-python',
      'java': 'mdi-language-java',
      'go': 'mdi-language-go',
      'rb': 'mdi-language-ruby',
      'php': 'mdi-language-php',
      'swift': 'mdi-language-swift',
      'sh': 'mdi-console',
      'sql': 'mdi-database',
      'yml': 'mdi-code-braces',
      'yaml': 'mdi-code-braces',
      'txt': 'mdi-file-document-outline',
      'pdf': 'mdi-file-pdf',
      'jpg': 'mdi-file-image',
      'jpeg': 'mdi-file-image',
      'png': 'mdi-file-image',
      'gif': 'mdi-file-image',
      'svg': 'mdi-file-image',
      'gitignore': 'mdi-git',
      'gitattributes': 'mdi-git',
    };
  
    return iconMap[extension] || 'mdi-file-outline';
  };
  
  // Determine icon color based on file extension
  const getFileIconColor = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const colorMap: ColorMap = {
      'cs': 'purple',
      'js': 'amber darken-2',
      'ts': 'blue',
      'vue': 'green',
      'html': 'deep-orange',
      'css': 'blue',
      'json': 'grey',
      'md': 'blue-grey',
      'py': 'blue darken-2',
      'java': 'brown',
      'go': 'cyan',
      'rb': 'red',
      'php': 'indigo',
      'swift': 'orange',
      'sh': 'grey darken-2',
      'sql': 'indigo lighten-1',
      'yml': 'pink',
      'yaml': 'pink',
      'gitignore': 'grey',
      'gitattributes': 'grey',
    };
  
    return colorMap[extension] || 'grey';
  };
  </script>
  
  <style scoped>
  .file-tree-item {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 14px;
  }
  
  .item-row {
    height: 32px;
    padding-right: 16px;
  }
  
  .item-row:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  .clickable {
    cursor: pointer;
  }
  
  .expand-icon {
    width: 16px;
    cursor: pointer;
  }
  
  .expand-icon-placeholder {
    width: 16px;
  }
  </style>