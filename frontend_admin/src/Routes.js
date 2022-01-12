// npm packages import
import React from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';

// React components import
import AddCompany from './pages/companies/AddCompany';
import Companies from './pages/companies/Companies';
import Dashboard from './pages/Dashboard';
import PageNotFound from './pages/PageNotFound';
import ManageCompany from './pages/companies/ManageCompany';
import Login from './pages/Login';
import Settings from './pages/Settings';
import ManageAccount from './pages/ManageAccount';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ChangePassword from './pages/ForgotPassword/ChangePassword';

// Other imports
import TokenManager from './utilities/tokenManager';

// Guard to check if user has token
const authGuard = (Component) => (props) => {
    const token = TokenManager.getToken();
    if (!token) {
        return (<Redirect to="/login" {...props} />);
    } else {
        return (<Component {...props} />);
    }

}

const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/">
                    <Redirect to="/dashboard" />
                </Route>
                <Route path="/companies/add-company" render={(props) => authGuard(AddCompany)(props)} />
                <Route path="/companies" exact render={(props) => authGuard(Companies)(props)} />
                <Route path="/companies/manage-company/:companyID" render={(props) => authGuard(ManageCompany)(props)} />
                <Route path="/dashboard" render={(props) => authGuard(Dashboard)(props)} />
                <Route path="/login" render={() => <Login />} />
                <Route path="/forgot-password" render={() => <ForgotPassword />} />
                <Route path="/change-password/:username/:otp" render={(props) => <ChangePassword {...props} />} />
                <Route exact path="/settings" render = {(props) => authGuard(Settings)(props) }/>
                <Route path="/settings/manage-account" render={(props) => authGuard(ManageAccount)(props)} />
                <Route path="*" render={() => <PageNotFound />} />
            </Switch>
        </Router>
    )
}

export default Routes;