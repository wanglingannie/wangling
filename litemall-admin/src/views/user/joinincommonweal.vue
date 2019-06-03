<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-date-picker v-model="listQuery.beginTime" class="filter-item" style="width: 200px;" type="datetime" placeholder="请输入开始时间" value-format="yyyy-MM-dd HH:mm:ss"/>
      <el-date-picker v-model="listQuery.endTime" class="filter-item" style="width: 200px;" type="datetime" placeholder="请输入结束时间" value-format="yyyy-MM-dd HH:mm:ss"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" width="100px" label="用户ID" prop="userId" sortable/>

      <el-table-column align="center" min-width="100px" label="用户名" prop="nickname"/>

      <el-table-column align="center" min-width="100px" label="真实姓名" prop="memberUsername"/>

      <el-table-column align="center" min-width="100px" label="捐赠积分" prop="integral"/>

      <el-table-column align="center" min-width="100px" label="捐赠时间" prop="addTime"/>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { listJoinInCommonweal } from '@/api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'JoinInCommonweal',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
        nickname: undefined,
        memberUsername: undefined,
        integral: undefined,
        addTime: undefined,
        beginTime: undefined,
        endTime: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listJoinInCommonweal(this.listQuery)
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
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户ID', '用户名', '真实姓名', '捐赠积分', '捐赠时间']
        const filterVal = ['userId', 'nickname', 'memberUsername', 'integral', 'addTime']
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          '活动统计'
        )
        this.downloadLoading = false
      })
    }
  }
}
</script>
