<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.title" clearable class="filter-item" style="width: 200px;" placeholder="请输入活动名称"/>
      <el-input v-model="listQuery.subtitle" clearable class="filter-item" style="width: 200px;" placeholder="请输入活动所属区域"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加活动</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="活动名称" prop="title" min-width="10%"/>

      <el-table-column align="center" label="活动区域" prop="subtitle" min-width="15%"/>

      <el-table-column align="center" label="活动类别" prop="topicType" min-width="10%"/>

      <el-table-column align="center" property="picUrl" label="图片" min-width="10%">
        <template slot-scope="scope">
          <img :src="scope.row.picUrl" width="80">
        </template>
      </el-table-column>

      <el-table-column align="center" label="活动详情" prop="content" min-width="8%">
        <template slot-scope="scope">
          <el-dialog :visible.sync="contentDialogVisible" title="活动详情">
            <div v-html="contentDetail"/>
          </el-dialog>
          <el-button type="primary" size="mini" @click="showContent(scope.row.content)">查看</el-button>
        </template>
      </el-table-column>

      <el-table-column align="center" label="开始时间" prop="startTime" min-width="10%"/>

      <el-table-column align="center" label="过期时间" prop="endTime" min-width="10%"/>

      <el-table-column align="center" label="底价" prop="price" min-width="5%"/>

      <el-table-column align="center" label="阅读数量" prop="readCount" min-width="7%"/>

      <!-- <el-table-column align="center" label="发布人" prop="mgrUserid"/> -->

      <el-table-column align="center" label="状态" min-width="10%">
        <template slot-scope="scope">
          <el-tag v-if="currentTime > scope.row.endTime" type="danger">已结束</el-tag>
          <el-tag v-if="currentTime < scope.row.endTime" type="success">未结束</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" class-name="fixed-width" min-width="30%">
        <template slot-scope="scope">
          <el-row>
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
            <!-- <el-button type="success" size="mini" style="width:100px" @click="handleCreateCode(scope.row)">生成二维码</el-button> -->
            <el-button type="success" size="mini" style="width:100px" @click="handleLink(scope.row)">查看二维码</el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :visibility-height="100" />
    </el-tooltip>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="dataForm.title"/>
        </el-form-item>
        <el-form-item label="活动区域" prop="subtitle">
          <el-input v-model="dataForm.subtitle"/>
        </el-form-item>
        <el-form-item label="活动类别" prop="topicType">
          <el-input v-model="dataForm.topicType"/>
        </el-form-item>
        <el-form-item label="活动图片" prop="picUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif">
            <img v-if="dataForm.picUrl" :src="dataForm.picUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>
        <el-form-item style="width: 700px;" label="活动内容">
          <editor :init="editorInit" v-model="dataForm.content"/>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="dataForm.startTime"
            type="datetime"
            placeholder="开始时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 300px"/>
        </el-form-item>
        <el-form-item label="过期时间" prop="endTime">
          <el-date-picker
            v-model="dataForm.endTime"
            type="datetime"
            placeholder="选择时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 300px"/>
        </el-form-item>
        <el-form-item label="商品低价" prop="price">
          <el-input v-model="dataForm.price"/>
        </el-form-item>
        <el-form-item label="阅读量" prop="readCount">
          <el-input v-model="dataForm.readCount"/>
        </el-form-item>
        <!-- <el-form-item label="发布人" prop="mgrUserid">
          <el-input v-model="dataForm.mgrUserid"/>
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
    <!-- 查看链接框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisibles">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="二维码链接" prop="codeurl">
          <el-input v-model="dataForm.codeurl"/>
          <img :src="img">
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style>
.el-dialog {
  width: 800px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
</style>

<script>
import { listTopic, createTopic, updateTopic, deleteTopic, createCode } from '@/api/topic'
import { createStorage, uploadPath } from '@/api/storage'
import BackToTop from '@/components/BackToTop'
import Editor from '@tinymce/tinymce-vue'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { getToken } from '@/utils/auth'

export default {
  name: 'Topic',
  components: { BackToTop, Editor, Pagination },
  data() {
    return {
      currentTime: '',
      uploadPath,
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        subtitle: undefined,
        topicType: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        titile: undefined,
        subtitle: undefined,
        topicType: undefined,
        picUrl: undefined,
        content: '',
        price: undefined,
        readCount: undefined,
        goods: [],
        startTime: '',
        endTime: '',
        img: ''

      },
      img: '',
      contentDetail: '',
      contentDialogVisible: false,
      dialogFormVisible: false,
      dialogFormVisibles: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        title: [
          { required: true, message: '活动名称不能为空', trigger: 'blur' }
        ],
        subtitle: [
          { required: true, message: '活动区域不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '活动内容不能为空', trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      editorInit: {
        language: 'zh_CN',
        convert_urls: false,
        plugins: [
          'advlist anchor autolink autosave code codesample colorpicker colorpicker contextmenu directionality emoticons fullscreen hr image imagetools importcss insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textcolor textpattern visualblocks visualchars wordcount'
        ],
        toolbar: [
          'searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample',
          'hr bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen'
        ],
        images_upload_handler: function(blobInfo, success, failure) {
          const formData = new FormData()
          formData.append('file', blobInfo.blob())
          createStorage(formData)
            .then(res => {
              success(res.data.data.url)
            })
            .catch(() => {
              failure('上传失败，请重新上传')
            })
        }
      }
    }
  },
  computed: {
    headers() {
      return {
        'X-Litemall-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.currentTime = this.format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      this.listLoading = true
      listTopic(this.listQuery)
        .then(response => {
          this.list = response.data.data.items
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    },
    format(date, fmt) {
      const consts = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'H+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds() // 毫秒
      }
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      for (const k in consts) {
        if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (consts[k]) : (('00' + consts[k]).substr(('' + consts[k]).length)))
      }
      return fmt
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        titile: undefined,
        subtitle: undefined,
        topicType: undefined,
        picUrl: undefined,
        content: '',
        price: undefined,
        readCount: undefined,
        goods: [],
        startTime: '',
        endTime: '',
        img: ''
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    uploadPicUrl: function(response) {
      this.dataForm.picUrl = response.data.url
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createTopic(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建活动成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    showContent(content) {
      this.contentDetail = content
      this.contentDialogVisible = true
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateTopic(this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.dataForm)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '更新活动成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleDelete(row) {
      deleteTopic(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除活动成功'
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleCreateCode(row) {
      createCode(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '生成二维码成功'
          })

          var img = 'data:image/png;base64,' + response.data.data
          this.dataForm.img = 'data:image/png;base64,' + response.data.data
          this.img = img
          // const index = this.list.indexOf(row)
          // this.list.splice(index, 1)
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: '生成二维码失败'
          })
        })
    },
    handleLink(row) {
      createCode(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '生成二维码成功'
          })

          var img = 'data:image/png;base64,' + response.data.data
          this.dataForm.img = 'data:image/png;base64,' + response.data.data
          this.img = img
          // const index = this.list.indexOf(row)
          // this.list.splice(index, 1)
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: '生成二维码失败'
          })
        })
      this.dataForm = Object.assign({}, row)
      this.dialogFormVisibles = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '活动ID',
          '活动名称',
          '活动区域',
          '活动类别',
          '活动内容',
          '活动图片',
          '有效期',
          '商品低价',
          '阅读量',
          '活动商品'
        ]
        const filterVal = [
          'id',
          'title',
          'subtitle',
          'topicType',
          'content',
          'picUrl',
          'startTime',
          'endTime',
          'price',
          'readCount',
          'goods'
        ]
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '活动信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
