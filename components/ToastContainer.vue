<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] space-y-2">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden"
          :class="getToastClass(toast.type)"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <component :is="getIcon(toast.type)" class="h-6 w-6" :class="getIconClass(toast.type)" />
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium" :class="getTitleClass(toast.type)">
                  {{ toast.title }}
                </p>
                <p v-if="toast.message" class="mt-1 text-sm" :class="getMessageClass(toast.type)">
                  {{ toast.message }}
                </p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  @click="removeToast(toast.id)"
                  class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span class="sr-only">關閉</span>
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// Icons as string templates for better performance
const CheckCircleIcon = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
})

const XCircleIcon = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
})

const ExclamationTriangleIcon = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>`
})

const InformationCircleIcon = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
})

const { toasts, removeToast } = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircleIcon
    case 'error': return XCircleIcon
    case 'warning': return ExclamationTriangleIcon
    case 'info': return InformationCircleIcon
    default: return InformationCircleIcon
  }
}

const getToastClass = (type: string) => {
  switch (type) {
    case 'success': return 'bg-white border-l-4 border-success-400'
    case 'error': return 'bg-white border-l-4 border-error-400'
    case 'warning': return 'bg-white border-l-4 border-warning-400'
    case 'info': return 'bg-white border-l-4 border-accent-400'
    default: return 'bg-white border-l-4 border-gray-400'
  }
}

const getIconClass = (type: string) => {
  switch (type) {
    case 'success': return 'text-success-400'
    case 'error': return 'text-error-400'
    case 'warning': return 'text-warning-400'
    case 'info': return 'text-accent-400'
    default: return 'text-gray-400'
  }
}

const getTitleClass = (type: string) => {
  switch (type) {
    case 'success': return 'text-success-800'
    case 'error': return 'text-error-800'
    case 'warning': return 'text-warning-800'
    case 'info': return 'text-accent-800'
    default: return 'text-gray-800'
  }
}

const getMessageClass = (type: string) => {
  switch (type) {
    case 'success': return 'text-success-700'
    case 'error': return 'text-error-700'
    case 'warning': return 'text-warning-700'
    case 'info': return 'text-accent-700'
    default: return 'text-gray-700'
  }
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.toast-move {
  transition: transform 0.3s ease;
}
</style> 