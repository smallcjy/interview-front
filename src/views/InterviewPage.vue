<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Textarea } from '@/components/ui/textarea'
import { CornerDownLeft, Paperclip, Mic } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import CameraIcon from '@/assets/camera.svg'

const router = useRouter()
const { toast } = useToast()
const videoRef = ref<HTMLVideoElement | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const usingroomnumber = ref('')
const isCameraOn = ref(false)

// 示例聊天消息
const messages = ref([
  { sender: '系统消息', timestamp: 1833028400000, text: '面试即将开始。' },
  { sender: '面试官', timestamp: 1833024800000, text: 'Hello!' },
  { sender: '面试者', timestamp: 1833032000000, text: 'Hi there!' },
])
const getVariant = (sender: string) => {
  if (sender === '面试官') return 'outline'
  if (sender === '系统消息') return 'secondary'
  return 'default'
}
const newMessage = ref('')
// 初始化房间号，从url中的interviewId=tk3xjf 获得
onMounted(() => {
  usingroomnumber.value = getQueryParam('interviewId') || ''
  fetchInterviewMetadata()
})

// 开始面试函数
const startInterview = async () => {
  try {
    // 如果已经有媒体流，先停止它
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop())
      mediaStream.value = null
      isCameraOn.value = false
    }

    // 请求摄像头权限
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    const videoElement = videoRef.value

    if (videoElement) {
      videoElement.srcObject = stream
      videoElement.muted = true // 消除自动播放限制
      videoElement.playsInline = true // 确保在移动设备上内联播放
      await videoElement.play().catch(err => {
        console.error('视频播放错误:', err)
      })
    }

    mediaStream.value = stream
    isCameraOn.value = true

    toast({
      title: "Success",
      description: "摄像头已开启！",
      variant: "default"
    })
  } catch (error) {
    console.error('无法访问摄像头', error)
    toast({
      title: "Error",
      description: "无法访问摄像头",
      variant: "destructive"
    })
  }
}

// 停止面试函数
const stopInterview = () => {
  try {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop())
      mediaStream.value = null
    }
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
    isCameraOn.value = false

    toast({
      title: "Success",
      description: "本次面试已结束！",
      variant: "default"
    })
    // 如果是面试官，重定向到面试结果反馈页面
    if (localStorage.getItem('role') === 'interviewer') {
      // 从url获取面试id，从localStorage获取面试官id
      redirectToInterviewResult(
        getQueryParam('interviewId') || '',
        localStorage.getItem('interviewerId') || ''
      )
    }else{
      // 如果是面试者，重定向到面试结果页面
      redirectToInterviewScore(
        getQueryParam('interviewId') || '',
        localStorage.getItem('intervieweeId') || ''
      )
    }

  } catch (error) {
    console.error('无法关闭摄像头', error)
    toast({
      title: "Error",
      description: "无法关闭摄像头",
      variant: "destructive"
    })
  }
}

// 重定向到面试结果反馈页面的函数
const redirectToInterviewResult = (interviewId: string, interviewer: string) => {
  const baseUrl = 'http://localhost:5173/result?'
  const url = new URL(baseUrl)
  url.searchParams.append('interviewId', interviewId)
  url.searchParams.append('interviewer', interviewer)

  window.location.href = url.toString()
}

// 重定向到面试结果页面的函数
const redirectToInterviewScore = (interviewId: string, interviewee: string) => {
  const baseUrl = 'http://localhost:5173/score?'
  const url = new URL(baseUrl)
  url.searchParams.append('interviewId', interviewId)
  url.searchParams.append('interviewee', interviewee)

  window.location.href = url.toString()
}

// 用户发送消息函数
const sendMessage = () => {
  if (newMessage.value.trim() !== '') {
    messages.value.push({
      sender: localStorage.getItem('role') === 'interviewer' ? '面试官' : '面试者',
      timestamp: Date.now(),
      text: newMessage.value.trim()
    })
    newMessage.value = ''
  }
}

function getQueryParam(param: string) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const interviewMetadata = ref({
  interviewId: '',
  interviewer: '',
  interviewee: ''
});

function fetchInterviewMetadata() {
  // 从 URL 参数获取面试元数据
  interviewMetadata.value = {
    interviewId: getQueryParam('interviewId'),
    interviewer: getQueryParam('interviewer'),
    interviewee: getQueryParam('interviewee')
  };
}
</script>

<template>
  <div class="flex w-full h-screen p-4 gap-4">
    <ResizablePanelGroup
      id="handle-demo-group-1"
      direction="horizontal"
      class="h-full w-full rounded-lg border"
    >
      <!-- Video Panel -->
      <ResizablePanel id="handle-demo-panel-1" :default-size="50">
          <Card class="flex w-full h-full flex-col border-2">
            <CardHeader class="space-y-2 pb-4">
              <div class="flex items-center justify-between">
                <CardTitle class="text-2xl font-bold">视频面试</CardTitle>
                <span class="rounded-full bg-muted px-3 py-1 text-sm">
                  房间号：{{ usingroomnumber }}
                </span>
              </div>
            </CardHeader>
            
            <CardContent class="flex flex-1 flex-col gap-6 p-6 h-full">
              <div class="relative flex-1 overflow-hidden rounded-xl bg-slate-100">
                <video 
                  v-show="isCameraOn" 
                  ref="videoRef" 
                  autoplay 
                  muted 
                  playsinline 
                  class="h-full w-full rounded-xl object-cover transition-opacity duration-200"
                />
                <div v-show="!isCameraOn" 
                     class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <img :src="CameraIcon" alt="Camera Off" class="h-32 w-32 opacity-40" />
                  <p class="mt-4 text-sm text-muted-foreground">
                    摄像头未开启，请点击"开始面试"按钮
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <Button 
                  @click="startInterview"
                  class="flex-1 font-medium"
                  size="lg"
                  :disabled="isCameraOn"
                >
                  开始面试
                </Button>
                
                <Button 
                  @click="stopInterview"
                  variant="destructive"
                  class="flex-1 font-medium"
                  size="lg"
                  :disabled="!isCameraOn"
                >
                  结束面试
                </Button>
              </div>
            </CardContent>
          </Card>
      </ResizablePanel>

      <ResizableHandle id="handle-demo-handle-1" with-handle />

      <!-- Chat Panel -->
      <ResizablePanel id="handle-demo-panel-2" :default-size="50">
          <Card class="flex w-full h-full flex-col border-2">
            <CardHeader class="pb-4">
              <CardTitle>对话记录</CardTitle>
            </CardHeader>
            <!-- 消息显示区域 -->
            <div class="flex flex-col h-full">
              <div class="space-y-4">
                <CardContent class="flex flex-1 flex-col gap-4 h-full">
                    <div class="flex-1 overflow-y-auto">
                      <div class="space-y-4 px-2">
                        <div v-for="(message, index) in messages" 
                             :key="index" 
                             class="flex flex-col space-y-1">
                          <div :class="{
                            'text-left': message.sender === '面试官' || message.sender === '系统消息',
                            'text-right': message.sender !== '面试官' && message.sender !== '系统消息'
                          }">
                          <div class="text-xs text-gray-500">
                            {{ message.sender }} - {{ new Date(message.timestamp).toLocaleString() }}
                          </div>
                            <Badge :variant = getVariant(message.sender)>
                              {{ message.text }}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
              </div>
            </div>
            <!-- 消息输入区域 -->
            <div class="p-4 border-t mt-auto">
              <CardContent class="border-t pt-4">
                    <form @submit.prevent="sendMessage" class="flex flex-col gap-3">
                      <Textarea
                        v-model="newMessage"
                        placeholder="输入消息，友好交流..."
                        class="min-h-[100px] resize-none rounded-lg border-2 focus:border-primary"
                     />
                      <Button type="submit" class="w-full">
                        发送消息
                        <CornerDownLeft class="ml-2 h-4 w-4" />
                      </Button> 
                    </form>
                  </CardContent>
            </div>
          </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>
<style scoped>
:deep(.resizable-handle) {
  width: 4px;
  background-color: #e5e7eb;
  transition: all 0.2s;
}

:deep(.resizable-handle:hover) {
  background-color: #d1d5db;
}

.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}
</style>