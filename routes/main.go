package routes

import (
	"MareWood/config"
	"MareWood/controller"
	"MareWood/middlewares"
	"net/http"

	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	// 设置gin模式
	gin.SetMode(config.Cfg.GinMode)

	r := gin.Default()
	r.Use(middlewares.Cors())

	{
		r.GET("/ping", func(c *gin.Context) { //服务健康检查
			c.JSON(http.StatusOK, gin.H{"message": "pong"})
		})

		r.Static(config.Cfg.WebsUrl, config.Cfg.WebRootDir)
		r.Static("/public", config.Cfg.ClientDir)

		r.GET("/", func(c *gin.Context) {
			c.Redirect(http.StatusMovedPermanently, "/public")
		})

		r.POST(config.Cfg.WebHookUrl, controller.JobWebHook)
		r.Any("/websocket", controller.WebsocketMsg)
	}

	v1Public := r.Group("/v1")
	{
		v1Public.POST("/login", controller.UserLogin)
		v1Public.POST("/register", controller.UserRegister)
	}

	v1 := r.Group("/v1").Use(middlewares.JWTAuth())
	{
		//系统信息
		v1.GET("/system/info", middlewares.RoleReporter(), controller.SystemInfo)
		//仓库相关
		v1.GET("/repositories", middlewares.RoleReporter(), controller.RepositoryFindAll)
		v1.GET("/repository_find", middlewares.RoleReporter(), controller.RepositoryFind)
		v1.POST("/repository/create", middlewares.RoleDeveloper(), controller.RepositoryCreate)
		v1.GET("/repository/delete", middlewares.RoleAdmin(), controller.RepositoryDestroy)
		v1.GET("/repository/git_pull", middlewares.RoleDeveloper(), controller.RepositoryGitPull)
		v1.GET("/repository/discard_change", middlewares.RoleDeveloper(), controller.RepositoryDiscardChange)
		v1.GET("/repository/git_branch", middlewares.RoleReporter(), controller.RepositoryBranch)
		v1.GET("/repository/prune_branch", middlewares.RoleDeveloper(), controller.RepositoryPruneBranch)
		v1.GET("/repository/delete_depend", middlewares.RoleDeveloper(), controller.RepositoryDeleteDepend)
		v1.GET("/repository/get_script", middlewares.RoleReporter(), controller.RepositoryScript)
		v1.GET("/repository/update_field", middlewares.RoleDeveloper(), controller.RepositoryUpdateField)
		v1.GET("/repository/commit_record", middlewares.RoleReporter(), controller.CommitRecord)
		v1.GET("/repository/reset", middlewares.RoleDeveloper(), controller.RepositoryReset)

		//任务分类
		v1.GET("/categories", middlewares.RoleReporter(), controller.CategoryFindAll)
		v1.POST("/category/create", middlewares.RoleDeveloper(), controller.CategoryCreate)
		v1.GET("/category/update_field", middlewares.RoleDeveloper(), controller.CategoryUpdateField)
		v1.GET("/category/delete", middlewares.RoleAdmin(), controller.CategoryDestroy)
		//任务
		v1.GET("/jobs", middlewares.RoleReporter(), controller.JobFindAll)
		v1.GET("/jobs_find", middlewares.RoleReporter(), controller.JobFind)
		v1.POST("/job/create", middlewares.RoleDeveloper(), controller.JobCreate)
		v1.GET("/job/update_branch", middlewares.RoleDeveloper(), controller.JobUpdateBranch)
		v1.GET("/job/update_field", middlewares.RoleDeveloper(), controller.JobUpdateField)
		v1.GET("/job/delete", middlewares.RoleAdmin(), controller.JobDestroy)
		v1.GET("/job/run", middlewares.RoleDeveloper(), controller.JobRun)
		v1.GET("/job/lock", middlewares.RoleDeveloper(), controller.JobLock)
		//user
		v1.GET("/users", middlewares.RoleReporter(), controller.UserFindAll)
		v1.GET("/user/delete", middlewares.RoleSuperAdmin(), controller.UserDestroy)
		v1.GET("/user/role_edit", middlewares.RoleSuperAdmin(), controller.UserRoleEdit)

	}

	return r
}
