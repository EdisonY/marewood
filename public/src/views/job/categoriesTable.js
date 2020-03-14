import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import LinkIcon from '@material-ui/icons/Link'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import UsbIcon from '@material-ui/icons/Usb'
import Computer from '@material-ui/icons/Computer';
import Announcement from '@material-ui/icons/Announcement';
import PlayCircleFilled from '@material-ui/icons/PlayCircleFilled';
import DeviceHub from '@material-ui/icons/DeviceHub';
import {
    TableRow,
    TableHead,
    TableCell,
    TableBody,
    Table,
    Tooltip,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions, Button, Dialog
} from '@material-ui/core';
import JobStatus from "./jobStatus"
import HelperTooltips from "../../components/helperTooltips";
import SwitchBranchDialog from "./switchBranchDialog"
import Snackbar from '../../components/snackbar/index'
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen'
import DeleteIcon from '@material-ui/icons/Delete';
import {destroy,RunJob} from "../../api/job";


const styles = theme => ({
    table: {
        marginTop: theme.spacing(3),
        minWidth: 650,
    },
});


class CategoriesTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            destroyDialogShow:false,
            switchBranchDialog:{
                id:0,
                show:false,
                repositoryId:0,
            }
        };
        this.destroyId = 0;
    }

    componentDidMount() {

    }
    componentWillUnmount() {

    }
    runJob(row){
        if(row.Status === 3){
            Snackbar.warning("任务正在打包，请稍等");
            return
        }
        if(row.PassWord !== ""){
            Snackbar.warning("任务有密码，未做");
            return
        }
        RunJob({id:row.ID}).then(r=>{
            Snackbar.success("运行成功，正在打包");
            this.props.refresh()
        }).catch(()=>{})
    }
    openSwitchBranchDialog(row){
        if(row.Status === 3){
            Snackbar.warning("任务正在打包，请稍等");
            return
        }
        this.setState({
            switchBranchDialog:{
                id:row.ID,
                show:true,
                repositoryId:row.RepositoryId
            }
        })
    }
    switchSuccess(){
        this.setState({
            switchBranchDialog:{
                id:0,
                show:false,
                repositoryId:0
            }
        });
        this.props.refresh();
    }
    closeSwitchBranchDialog(){
        this.setState({
            switchBranchDialog:{
                id:0,
                show:false,
                repositoryId:0
            }
        })
    }
    destroyDialogOpen(id){
        this.destroyId = id;
        this.setState({destroyDialogShow:true})
    }

    destroyDialogClose () {
        this.setState({destroyDialogShow:false})
    }
    destroyConfirm () {
        destroy({id:this.destroyId}).then(r=>{
            Snackbar.success("删除成功！");
            this.setState({destroyDialogShow:false});
            this.props.refresh()
        }).catch(()=>{})
    }
    openJobUrl(row){
        if(row.Status !== 1){
            Snackbar.error("任务没有打包成功！");
            return
        }
        window.open(row.Url)
    }
    render() {
        const {classes} = this.props;
        return (
            <div>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">ID</TableCell>
                            <TableCell align="center">加密</TableCell>
                            <TableCell align="center">任务名称</TableCell>
                            <TableCell align="center">任务状态</TableCell>
                            <TableCell align="center">
                                当前分支
                                <HelperTooltips help="当前任务分支，如有需要请先切换分支"/>
                            </TableCell>
                            <TableCell align="center">运行次数</TableCell>
                            <TableCell align="center">
                                访问地址
                                <HelperTooltips help="打包成功时可访问的页面🤓"/>
                            </TableCell>
                            <TableCell align="center">
                                WebHook
                                <HelperTooltips help="触发任务的钩子，目前没有使用队列，如果任务资源被占用则无法打包"/>
                            </TableCell>
                            <TableCell align="center">终端信息</TableCell>
                            <TableCell align="center">
                                附加脚本
                                <HelperTooltips help="打包成功运行的脚本，多个用 ; 隔开"/>
                            </TableCell>
                            <TableCell align="center">任务描述</TableCell>
                            <TableCell align="center">打包目录</TableCell>
                            <TableCell align="center">打包命令</TableCell>
                            <TableCell align="center">操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            this.props.tableData.map(row => (
                                <TableRow key={row.ID}>
                                    <TableCell align="center">{row.ID}</TableCell>
                                    <TableCell align="center">
                                        {
                                            row.PassWord ? (
                                                <Tooltip title="任务被加密" interactive>
                                                    <IconButton color="primary">
                                                        <LockIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="任务公开" interactive>
                                                    <IconButton color="primary">
                                                        <LockOpenIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell align="center" style={{fontSize:"12px"}}>{row.Name}</TableCell>
                                    <TableCell align="center">
                                        <JobStatus status={row.Status} />
                                    </TableCell>
                                    <TableCell align="center">{row.Branch}</TableCell>
                                    <TableCell align="center">{row.RunQuantity}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={row.Status !== 1 ? "没有打包成功之前是不能访问的" : row.Url} interactive>
                                            <IconButton color="primary" onClick={this.openJobUrl.bind(this,row)}>
                                                { row.Status !== 1 ? <LinkOffIcon/>: <LinkIcon/>}
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={ row.WebHookUrl } interactive>
                                            <IconButton color="primary">
                                                <UsbIcon/>
                                            </IconButton>
                                        </Tooltip>

                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={
                                            <div style={{whiteSpace: "pre-wrap"}}>
                                                {row.TerminalInfo}
                                            </div>
                                        } interactive>
                                            <IconButton color="primary">
                                                <Computer/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={
                                            <div style={{whiteSpace: "pre-wrap"}}>
                                                {row.SuccessScript}
                                            </div>
                                        } interactive>
                                            <IconButton color="primary">
                                                <Computer/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={row.Desc} interactive>
                                            <IconButton color="primary">
                                                <Announcement/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <span className="tag">{(row.BuildDir)}</span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <span className="tag">{(row.BuildCommand)}</span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="切换分支" interactive>
                                            <IconButton color="primary" onClick={this.openSwitchBranchDialog.bind(this,row)}>
                                                <DeviceHub/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="运行任务" interactive>
                                            <IconButton color="primary"
                                                        onClick={this.runJob.bind(this, row)}>
                                                <PlayCircleFilled/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="删除任务" interactive>
                                            <IconButton color="primary"
                                                        onClick={this.destroyDialogOpen.bind(this,row.ID)}>
                                                <DeleteIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                <SwitchBranchDialog
                    jobId={this.state.switchBranchDialog.id}
                    repositoryId={this.state.switchBranchDialog.repositoryId}
                    open={this.state.switchBranchDialog.show}
                    onClose={this.closeSwitchBranchDialog.bind(this)}
                    switchSuccess={this.switchSuccess.bind(this)}/>
                <Dialog
                    open={this.state.destroyDialogShow}
                    onClose={this.destroyDialogClose.bind(this)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"确认删除任务?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            你确认要删除这个任务？
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.destroyDialogClose.bind(this)} color="primary">
                            关闭
                        </Button>
                        <Button onClick={this.destroyConfirm.bind(this)} color="secondary" autoFocus>
                            确认
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

}


export default withStyles(styles)(CategoriesTable)
