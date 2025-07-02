<template>
  <div class="space-y-6">
    <!-- Step 1: Context Capture -->
    <StepContextCapture 
      v-if="formStore.currentStep === 1"
      @next="formStore.nextStep"
    />
    
    <!-- Step 2: Adaptive Questions -->
    <StepAdaptiveQuestions 
      v-if="formStore.currentStep === 2"
      @next="formStore.nextStep"
      @prev="formStore.prevStep"
    />
    
    <!-- Step 3: Structure Preview -->
    <StepStructurePreview 
      v-if="formStore.currentStep === 3"
      @next="formStore.nextStep"
      @prev="formStore.prevStep"
    />
    
    <!-- Step 4: Final Info -->
    <StepFinalInfo 
      v-if="formStore.currentStep === 4"
      @next="formStore.nextStep"
      @prev="formStore.prevStep"
    />
    
    <!-- Step 5: Confirmation -->
    <StepConfirmation 
      v-if="formStore.currentStep === 5"
      @prev="formStore.prevStep"
      @restart="formStore.resetForm"
    />
  </div>
</template>

<script setup>
import { useFormStore } from '../stores/formStore.js'

// Components
import StepContextCapture from './steps/StepContextCapture.vue'
import StepAdaptiveQuestions from './steps/StepAdaptiveQuestions.vue'
import StepStructurePreview from './steps/StepStructurePreview.vue'
import StepFinalInfo from './steps/StepFinalInfo.vue'
import StepConfirmation from './steps/StepConfirmation.vue'

// Store
const formStore = useFormStore()
</script>